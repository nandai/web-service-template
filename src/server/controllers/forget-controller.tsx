/**
 * (C) 2016-2017 printf.jp
 */
import * as React    from 'react';
import * as ReactDOM from 'react-dom/server';
import {view}        from './view';
import Root          from 'client/components/root';
import ForgetView    from 'client/components/views/forget-view/forget-view';
import {Store}       from 'client/components/views/forget-view/store';
import ClientR       from 'client/libs/r';

import express = require('express');
import slog =    require('../slog');

/**
 * パスワードを忘れたコントローラ
 */
export default class ForgetController
{
    private static CLS_NAME = 'ForgetController';

    /**
     * GET /forget
     *
     * @param   req httpリクエスト
     * @param   res httpレスポンス
     */
    static index(req : express.Request, res : express.Response) : void
    {
        const log = slog.stepIn(ForgetController.CLS_NAME, 'index');
        const locale = req.ext.locale;

        const store : Store =
        {
            locale:   locale,
            email:    '',
            message:  ''
        };

        const title = ClientR.text(ClientR.GO_FORGET, locale);
        const el = <ForgetView store={store}/>;
        const contents = ReactDOM.renderToString(<Root view={el} />);
        res.send(view(title, 'wst.js', contents));
        log.stepOut();
    }
}
