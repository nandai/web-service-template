/**
 * (C) 2016 printf.jp
 */
import Cookie       from './cookie';
import R            from './r';
import Utils        from './utils';
import ResponseData from './response-data';
import SessionModel, {Session} from '../models/session-model';

import express =    require('express');
import bodyParser = require('body-parser');
import slog =       require('../slog');
const co =          require('co');

/**
 * Access
 */
export default class Access
{
    private static CLS_NAME = 'Access';

    /**
     * bodyをJSONにパースする
     *
     * @param   req httpリクエスト
     * @param   req httpレスポンス
     */
    static jsonBodyParser(req : express.Request, res : express.Response, next : express.NextFunction)
    {
        const log = slog.stepIn(Access.CLS_NAME, 'jsonBodyParser');
        let bodyBuffer : Buffer;

        const fn = bodyParser.json(
        {
            verify: function (req : express.Request, res : express.Response, body : Buffer, encoding : string)
            {
                bodyBuffer = body;
            }
        });

        fn(req, res, function (err)
        {
            if (err)
            {
                log.d(`${req.method} ${req.path}`);
                log.w('param: ' + bodyBuffer.toString());

                const data = ResponseData.error(-1, R.text(R.BAD_REQUEST));
                res.status(err.status).json(data);
                log.stepOut();
                return;
            }

            log.stepOut();
            next();
        });
    }

    /**
     * アクセスの詳細ログを出力する
     *
     * @param   req httpリクエスト
     * @param   req httpレスポンス
     */
    static logger(req : express.Request, res : express.Response, next : express.NextFunction) : void
    {
        const log = slog.stepIn(Access.CLS_NAME, 'logger');

        // パス
        log.d(`${req.method} ${req.path}`);
        const referrer = req.header('referrer');

        if (referrer)
            log.d(`referrer:${referrer}`);

        // パラメータ
        if (Object.keys(req.query).length > 0) log.d('req.query:' + JSON.stringify(req.query, null, 2));
        if (Object.keys(req.body). length > 0) log.d('req.body:'  + JSON.stringify(req.body,  null, 2));

        // クッキー
        const cookies = req.header('cookie');

        if (cookies)
        {
            const obj = Utils.parseRawQueryString(cookies, ';');
            log.d('cookies:' + JSON.stringify(obj, null, 2));
        }

        // リクエストヘッダー
        const headers = req.headers;
        log.d('headers:' + JSON.stringify(headers, null, 2));

//      for (const key in headers)
//      {
//          if (key !== 'cookie')
//              log.d(`${key}: ${headers[key]}`)
//      }

        // アクセス元IP
        let ip = '0.0.0.0';
        let kind = '-';

        if (req.headers['x-forwarded-for'])
        {
            ip = req.headers['x-forwarded-for'];
            kind = 'a';
        }

        if (req.connection && req.connection.remoteAddress)
        {
            ip = req.connection.remoteAddress;
            kind = 'b';
        }

        if (req.connection['socket'] && req.connection['socket'].remoteAddress)
        {
            ip = req.connection['socket'].remoteAddress;
            kind = 'c';
        }

        if (req.socket && req.socket.remoteAddress)
        {
            ip = req.socket.remoteAddress;
            kind = 'd';
        }

        const pos = ip.lastIndexOf(':');
        if (pos > 0)
            ip = ip.substr(pos + 1);

        log.d(`(${kind}) IP:${ip}`);

        log.stepOut();
        next();
    }

    /**
     * セッション
     *
     * @param   req httpリクエスト
     * @param   req httpレスポンス
     */
    static session(req : express.Request, res : express.Response, next : express.NextFunction) : void
    {
        const log = slog.stepIn(Access.CLS_NAME, 'session');
        co(function* ()
        {
            const cookie = new Cookie(req, res);
            const sessionId = cookie.sessionId;
            let   session : Session = null;

            if (sessionId === undefined)
            {
                session = new Session();
                yield SessionModel.add(session);
                log.d('セッションを生成しました。');
            }
            else
            {
                session = yield SessionModel.find(sessionId);
                if (session === null)
                {
                    const data = ResponseData.error(-1, R.text(R.BAD_REQUEST));
                    res.status(400).json(data);
                    log.stepOut();
                    return;
                }

                req['command'] = session.command_id;

                session.refresh();
                session.command_id = null;
                yield SessionModel.update(session);
            }

            cookie.sessionId = session.id;
            req['sessionObj'] = session;

            log.stepOut();
            next();
        })
        .catch ((err) => Utils.internalServerError(err, res, log));
    }

    /**
     * 認証確認
     *
     * @param   req httpリクエスト
     * @param   req httpレスポンス
     */
    static auth(req : express.Request, res : express.Response, next : express.NextFunction) : void
    {
        const log = slog.stepIn(Access.CLS_NAME, 'auth');
        co(function* ()
        {
            const session : Session = req['sessionObj'];
            if (session.account_id === null)
            {
                // 未認証
                if (req.path.startsWith('/api/'))
                {
                    const data = ResponseData.error(-1, R.text(R.NO_LOGIN));
                    res.json(data);
                }
                else
                {
                    res.redirect('/');
                }
                log.stepOut();
            }
            else
            {
                // 認証済み
                log.stepOut();
                next();
            }
        })
        .catch ((err) => Utils.internalServerError(err, res, log));
    }

    /**
     * not found
     *
     * @param   req httpリクエスト
     * @param   req httpレスポンス
     */
    static notFound(req : express.Request, res : express.Response) : void
    {
        if (req.path.startsWith('/api/'))
        {
            const data = ResponseData.error(-1, R.text(R.NOT_FOUND));
            res.status(404).json(data);
        }
        else
        {
            res.status(404).render('404');
        }
    }
}
