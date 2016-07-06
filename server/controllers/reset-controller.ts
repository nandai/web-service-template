/**
 * (C) 2016 printf.jp
 */
import Utils from '../libs/utils';
import AccountModel, {Account} from '../models/account-model';

import express = require('express');
const slog =     require('../slog');
const co =       require('co');

/**
 * パスワードリセットコントローラ
 */
export default class ResetController
{
    private static CLS_NAME = 'ResetController';

    /**
     * @param   req httpリクエスト
     * @param   res httpレスポンス
     */
    static index(req : express.Request, res : express.Response) : void
    {
        const log = slog.stepIn(ResetController.CLS_NAME, 'index');
        co(function* ()
        {
            const param = req.query;
            const resetId = param.id;
            let account : Account = null;

            if (resetId)
                account = yield AccountModel.findByResetId(resetId);

            if (account) res.render('reset', {resetId});
            else         res.status(404).render('404');

            log.stepOut();
        })
        .catch ((err) => Utils.internalServerError(err, res, log));
    }
}
