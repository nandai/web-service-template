/**
 * (C) 2016-2017 printf.jp
 */
import {slog} from 'libs/slog';
import {view} from './view';

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
    static index(req : express.Request, res : express.Response)
    {
        const log = slog.stepIn(AboutApp.CLS_NAME, 'index');
        res.send(view(req));
        log.stepOut();
    }
}
