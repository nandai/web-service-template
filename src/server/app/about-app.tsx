/**
 * (C) 2016-2017 printf.jp
 */
import ClientApp from 'client/app/home-app';
import {slog}    from 'libs/slog';
import Utils     from 'server/libs/utils';
import {view}    from './view';

import express = require('express');

/**
 * about app
 */
export default class AboutApp
{
    private static CLS_NAME = 'AboutApp';

    /**
     * GET /about
     *
     * @param   req httpリクエスト
     * @param   res httpレスポンス
     */
    static async index(req : express.Request, res : express.Response)
    {
        const log = slog.stepIn(AboutApp.CLS_NAME, 'index');
        const locale = req.ext.locale;

        try
        {
            const app = new ClientApp({locale, currentUrl:'/about'});
            res.send(view(app, '/about'));
            log.stepOut();
        }
        catch (err) {Utils.internalServerError(err, res, log);}
    }
}
