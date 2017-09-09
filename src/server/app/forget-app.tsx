/**
 * (C) 2016-2017 printf.jp
 */
import {slog} from 'libs/slog';
import {view} from './view';

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
    static index(req : express.Request, res : express.Response)
    {
        const log = slog.stepIn(ForgetApp.CLS_NAME, 'index');
        res.send(view(req));
        log.stepOut();
    }
}
