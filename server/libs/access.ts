/**
 * (C) 2016 printf.jp
 */
import Config       from '../config';
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
    static jsonBodyParser(req : express.Request, res : express.Response, next : express.NextFunction) : void
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

                const data = ResponseData.error(-1, R.text(R.BAD_REQUEST, 'en'));
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

        // 言語
        let locale = 'en';

        if ('accept-language' in headers)
            locale = headers['accept-language'].substr(0, 2);

        if ('x-locale' in headers)
            locale = headers['x-locale'];

        locale = locale.toLowerCase();

        if (locale !== 'en'
        &&  locale !== 'ja')
        {
            locale = 'en';
        }

        req['locale'] = locale;

        // アクセス元IP
        const ip = Access.getIp(req);
        log.d(`(${ip.src}) IP:${ip.address}`);

        log.stepOut();
        next();
    }

    /**
     * IPアドレスを取得する
     *
     * @param   req httpリクエスト
     */
    private static getIp(req : express.Request) : {address : string, src : string}
    {
        let address = '0.0.0.0';
        let src = '-';  // 取得元

        if (req.headers['x-forwarded-for'])
        {
            address = req.headers['x-forwarded-for'];
            src = 'a';
        }

        else if (req.connection && req.connection.remoteAddress)
        {
            address = req.connection.remoteAddress;
            src = 'b';
        }

        else if (req.connection['socket'] && req.connection['socket'].remoteAddress)
        {
            address = req.connection['socket'].remoteAddress;
            src = 'c';
        }

        else if (req.socket && req.socket.remoteAddress)
        {
            address = req.socket.remoteAddress;
            src = 'd';
        }

        const pos = address.lastIndexOf(':');
        if (pos > 0)
            address = address.substr(pos + 1);

        if (address === '1')
            address = '127.0.0.1';

        return {address, src};
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
                    const locale : string = req['locale'];
                    const data = ResponseData.error(-1, R.text(R.BAD_REQUEST, locale));
                    res.status(400).json(data);
                    log.stepOut();
                    return;
                }

                req['command'] = session.command_id;
                session.command_id = null;

                if (Config.SESSION_REGENERATE)
                    session.regenerate();

                yield SessionModel.update(session);
            }

            cookie.sessionId =  session.id;
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
                    const locale : string = req['locale'];
                    const data = ResponseData.error(-1, R.text(R.NO_LOGIN, locale));
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
            const locale : string = req['locale'];
            const data = ResponseData.error(-1, R.text(R.NOT_FOUND, locale));
            res.status(404).json(data);
        }
        else
        {
            res.status(404).render('404');
        }
    }
}
