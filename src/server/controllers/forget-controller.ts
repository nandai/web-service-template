/**
 * (C) 2016-2017 printf.jp
 */
import {view}  from './view';
import ClientR from 'client/libs/r';

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
        const title = ClientR.text(ClientR.GO_FORGET, locale);

        res.send(view(title, 'wst.js'));
        log.stepOut();
    }
}
