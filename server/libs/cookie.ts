/**
 * (C) 2016 printf.jp
 */
import express = require('express');
import Config from '../config';

/**
 * Cookie
 */
export default class Cookie
{
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
    }

    /**
     * Passportのクッキーを削除する
     */
    clearPassport()
    {
        this.res.clearCookie('connect.sid');
    }
}
