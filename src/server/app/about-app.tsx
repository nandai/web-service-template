/**
 * (C) 2016-2017 printf.jp
 */
import * as React    from 'react';
import * as ReactDOM from 'react-dom/server';

import ClientApp     from 'client/app/home-app';
import Root          from 'client/components/root';
import ClientR       from 'client/libs/r';
import {slog}        from 'libs/slog';
import Utils         from 'server/libs/utils';
import {view}        from './view';

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
            const title = ClientR.text(ClientR.ABOUT, locale);
            const app = new ClientApp({locale, url:'/about'});
            const contents = ReactDOM.renderToString(<Root app={app} />);
            res.send(view(title, 'wst.js', contents, app.store));
            log.stepOut();
        }
        catch (err) {Utils.internalServerError(err, res, log);}
    }
}
