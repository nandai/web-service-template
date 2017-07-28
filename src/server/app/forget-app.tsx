/**
 * (C) 2016-2017 printf.jp
 */
import * as React    from 'react';
import * as ReactDOM from 'react-dom/server';

import Root          from 'client/components/root';
import ForgetView    from 'client/components/views/forget-view';
import {storeNS}     from 'client/components/views/forget-view/store';
import ClientR       from 'client/libs/r';
import {slog}        from 'libs/slog';
import {view}        from './view';

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
        const store = storeNS.init({locale});
        const title = ClientR.text(ClientR.GO_FORGET, locale);
        const el = <ForgetView store={store}/>;
        const contents = ReactDOM.renderToString(<Root view={el} />);
        res.send(view(title, 'wst.js', contents, store));
        log.stepOut();
    }
}
