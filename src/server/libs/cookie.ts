/**
 * (C) 2016-2017 printf.jp
 */
import Config from '../config';

import express = require('express');
import slog =    require('../slog');

/**
 * Cookie
 */
export default class Cookie
{
    private static CLS_NAME = 'Cookie';

    // クッキー名
    private static SESSION_ID = 'sessionId';

    private req : express.Request;
    private res : express.Response;

    /**
     * セッションID
     *
     * @property    sessionId
     * @type        string
     */
    get sessionId() : string {return this.req.cookies[Cookie.SESSION_ID];}
    set sessionId(sessionId : string)
    {
        this.req.cookies[Cookie.SESSION_ID] = sessionId;
        this.setCookie(  Cookie.SESSION_ID,   sessionId);
    }

    /**
     * @constructor
     *
     * @param   req httpリクエスト
     * @param   res httpレスポンス
     */
    constructor(req : express.Request, res : express.Response)
    {
        this.req = req;
        this.res = res;
    }

    /**
     * クッキーを設定する
     *
     * @param   name    クッキー名
     * @param   value   値
     */
    private setCookie(name : string, value : string) : void
    {
        const log = slog.stepIn(Cookie.CLS_NAME, 'setCookie');
        log.d(`${name}: ${value}`);

        if (value)
        {
            const options : express.CookieOptions =
            {
                httpOnly: true,
                secure: Config.hasSSL()
            };
            this.res.cookie(name, value, options);
        }
        else
        {
            this.res.clearCookie(name);
        }
        log.stepOut();
    }

    /**
     * Passportのクッキーを削除する
     */
    clearPassport() : void
    {
        this.res.clearCookie('connect.sid');
    }
}
