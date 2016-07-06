/**
 * (C) 2016 printf.jp
 */
import express = require('express');
const slog =     require('../slog');

/**
 * パスワードを忘れたコントローラ
 */
export default class ForgetController
{
    private static CLS_NAME = 'ForgetController';

    /**
     * @param   req httpリクエスト
     * @param   res httpレスポンス
     */
    static index(req : express.Request, res : express.Response) : void
    {
        const log = slog.stepIn(ForgetController.CLS_NAME, 'index');
        res.render('forget');
        log.stepOut();
    }
}
