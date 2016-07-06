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
const co =          require('co');
const slog =        require('../slog');

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
        const log = slog.stepIn(Access.CLS_NAME, 'jsonBodyParse');
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
        let referrer = req.header('referrer');

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

        log.stepOut();
        next();
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
            const cookie = new Cookie(req, res);
            const sessionId = cookie.sessionId;
            const session : Session = yield SessionModel.find(sessionId);

            if (session === null)
            {
                if (req.path.startsWith('/api/'))
                {
                    const data = ResponseData.error(-1, R.text(R.NO_LOGIN));
                    res.json(data);
                }
                else
                {
                    res.redirect('/');
                }
            }
            else
            {
                req['sessionObj'] = session;
                next();
            }

            log.stepOut();
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
