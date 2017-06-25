/**
 * (C) 2016-2017 printf.jp
 */
import * as React    from 'react';
import * as ReactDOM from 'react-dom/server';

import Root          from 'client/components/root';
import ForgetView    from 'client/components/views/forget-view';
import {Store}       from 'client/components/views/forget-view/store';
import ClientR       from 'client/libs/r';
import {Response}    from 'libs/response';
import {view}        from './view';

import express = require('express');
import slog =    require('../slog');

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

        const store : Store =
        {
            locale,
            email:    '',
            requestResetPasswordResult: {status:Response.Status.OK, message:{}},
            message:  ''
        };

        const title = ClientR.text(ClientR.GO_FORGET, locale);
        const el = <ForgetView store={store}/>;
        const contents = ReactDOM.renderToString(<Root view={el} />);
        res.send(view(title, 'wst.js', contents, store));
        log.stepOut();
    }
}
