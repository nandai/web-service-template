/**
 * (C) 2016-2017 printf.jp
 */
import {view} from './view';

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
        res.send(view('パスワードを忘れた', 'forget.js'));
        log.stepOut();
    }
}
