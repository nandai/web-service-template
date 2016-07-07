/**
 * (C) 2016 printf.jp
 */
import Utils                   from '../libs/utils';
import AccountModel, {Account} from '../models/account-model';

import express = require('express');
import slog =    require('../slog');
const co =       require('co');

/**
 * 設定コントローラ
 */
export default class SettingsController
{
    private static CLS_NAME = 'SettingsController';

    /**
     * 設定画面
     *
     * @param   req httpリクエスト
     * @param   res httpレスポンス
     */
    static index(req : express.Request, res : express.Response) : void
    {
        const log = slog.stepIn(SettingsController.CLS_NAME, 'index');
        co(function* ()
        {
            res.render('settings');
            log.stepOut();
        })
        .catch ((err) => Utils.internalServerError(err, res, log));
    }

    /**
     * 新しいメールアドレスを入力する画面
     *
     * @param   req httpリクエスト
     * @param   res httpレスポンス
     */
    static email(req : express.Request, res : express.Response) : void
    {
        const log = slog.stepIn(SettingsController.CLS_NAME, 'email');
        co(function* ()
        {
            res.render('settings-account-email');
            log.stepOut();
        })
        .catch ((err) => Utils.internalServerError(err, res, log));
    }

    /**
     * メールアドレス変更メールのリンクから遷移してくる画面
     *
     * @param   req httpリクエスト
     * @param   res httpレスポンス
     */
    static changeEmail(req : express.Request, res : express.Response) : void
    {
        const log = slog.stepIn(SettingsController.CLS_NAME, 'changeEmail');
        co(function* ()
        {
            const param = req.query;
            const changeId = param.id;
            let account : Account = null;

            if (changeId)
                account = yield AccountModel.findByChangeId(changeId);

            if (account) res.render('settings-account-email-change', {changeId});
            else         res.status(404).render('404');

            log.stepOut();
        })
        .catch ((err) => Utils.internalServerError(err, res, log));
    }
}
