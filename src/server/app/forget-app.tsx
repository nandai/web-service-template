/**
 * (C) 2016-2017 printf.jp
 */
import ClientApp from 'client/app/home-app';
import {storeNS} from 'client/components/views/forget-view/store';
import {slog}    from 'libs/slog';
import {view}    from './view';

import express = require('express');

/**
 * forget app
 */
export default class ForgetApp
{
    private static CLS_NAME = 'ForgetApp';

    /**
     * GET /forget
     *
     * @param   req httpリクエスト
     * @param   res httpレスポンス
     */
    static index(req : express.Request, res : express.Response) : void
    {
        const log = slog.stepIn(ForgetApp.CLS_NAME, 'index');
        const locale = req.ext.locale;
        const store : storeNS.Store = {locale, currentUrl:'/forget'};
        const app = new ClientApp(store);
        res.send(view(app, '/forget'));
        log.stepOut();
    }
}
