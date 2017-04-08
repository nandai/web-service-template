/**
 * (C) 2016-2017 printf.jp
 */
import {view, notFound} from './view';
import Utils            from '../libs/utils';
import AccountModel, {Account} from '../models/account-model';

import express = require('express');
import slog =    require('../slog');

/**
 * パスワードリセットコントローラ
 */
export default class ResetController
{
    private static CLS_NAME = 'ResetController';

    /**
     * GET /reset
     *
     * @param   req httpリクエスト
     * @param   res httpレスポンス
     */
    static async index(req : express.Request, res : express.Response)
    {
        const log = slog.stepIn(ResetController.CLS_NAME, 'index');
        try
        {
            const param = req.query;
            const resetId = param.id;
            let account : Account = null;

            if (resetId)
                account = await AccountModel.findByResetId(resetId);

            if (account) res.send(view('パスワードリセット', 'reset.js', resetId));
            else         notFound(res);

            log.stepOut();
        }
        catch (err) {Utils.internalServerError(err, res, log)};
    }
}
