/**
 * (C) 2016-2017 printf.jp
 */
import {Response}            from 'libs/response';
import CommonUtils           from 'libs/utils';
import SessionAgent          from '../agents/session-agent';
import {forbidden, notFound} from '../app/view';
import {Session}             from '../models/session';
import Cookie                from './cookie';
import R                     from './r';
import Utils                 from './utils';

import express =    require('express');
import bodyParser = require('body-parser');
import slog =       require('../slog');

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
            verify: (_req : express.Request, _res : express.Response, body : Buffer, encoding : string) =>
            {
                bodyBuffer = body;
            }
        });

        fn(req, res, (err) =>
        {
            if (err)
            {
                log.d(`${req.method} ${req.path}`);
                log.w('param: ' + bodyBuffer.toString());

                res.ext.badRequest('en');
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

        if (referrer) {
            log.d(`referrer:${referrer}`);
        }

        // パラメータ
        if (Object.keys(req.query).length > 0) {log.d('req.query:' + JSON.stringify(req.query, null, 2));}
        if (Object.keys(req.body). length > 0) {log.d('req.body:'  + JSON.stringify(req.body,  null, 2));}

        // クッキー
        const cookies = req.header('cookie');

        if (cookies)
        {
            const obj = CommonUtils.parseRawQueryString(cookies, ';');
            log.d('cookies:' + JSON.stringify(obj, null, 2));
        }

        // リクエストヘッダー
        const {headers} = req;
        log.d('headers:' + JSON.stringify(headers, null, 2));

//      for (const key in headers)
//      {
//          if (key !== 'cookie')
//              log.d(`${key}: ${headers[key]}`)
//      }

        // 言語
        req.ext.locale = Utils.getLocale(req);

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
        if (pos > 0) {
            address = address.substr(pos + 1);
        }

        if (address === '1') {
            address = '127.0.0.1';
        }

        return {address, src};
    }

    /**
     * セッション
     *
     * @param   req httpリクエスト
     * @param   req httpレスポンス
     */
    static async session(req : express.Request, res : express.Response, next : express.NextFunction)
    {
        const log = slog.stepIn(Access.CLS_NAME, 'session');
        try
        {
            const headers = req.headers;
            const cookie = new Cookie(req, res);
            const sessionId = ('x-session-id' in headers ? headers['x-session-id'] : cookie.sessionId);
            let   session : Session = null;

            if (sessionId === undefined)
            {
                session = await SessionAgent.add();
                log.d('セッションを生成しました。');
            }
            else
            {
                session = await SessionAgent.find(sessionId);
                if (session === null)
                {
                    // const locale = req.ext.locale;
                    // res.ext.badRequest(locale);
                    // log.stepOut();
                    // return;
                    session = await SessionAgent.add();
                    log.d('セッションを再生成しました。');
                }
                else
                {
                    req.ext.command = session.command_id;
                    session.command_id = null;
                    await SessionAgent.update(session);
                }
            }

            cookie.sessionId = session.id;
            req.ext.session =  session;

            log.stepOut();
            next();
        }
        catch (err) {Utils.internalServerError(err, res, log);}
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
        try
        {
            const session : Session = req.ext.session;
            if (session.account_id === null || session.sms_id)
            {
                // 未認証
                if (req.path.startsWith('/api/'))
                {
                    const locale = req.ext.locale;
                    res.ext.error(Response.Status.FAILED, R.text(R.NO_LOGIN, locale));
                }
                else
                {
                    forbidden(req, res);
                }
                log.stepOut();
            }
            else
            {
                // 認証済み
                log.stepOut();
                next();
            }
        }
        catch (err) {Utils.internalServerError(err, res, log);}
    }

    /**
     * not found
     *
     * @param   req httpリクエスト
     * @param   req httpレスポンス
     */
    static notFound(req : express.Request, res : express.Response) : void
    {
        const log = slog.stepIn(Access.CLS_NAME, 'notFound');

        if (req.path.startsWith('/api/'))
        {
            const locale = req.ext.locale;
            const data =
            {
                status:  Response.Status.FAILED,
                message: R.text(R.NOT_FOUND, locale)
            };
            res.status(404).json(data);
        }
        else
        {
            notFound(req, res);
        }

        log.stepOut();
    }
}
