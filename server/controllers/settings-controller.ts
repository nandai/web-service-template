/**
 * (C) 2016 printf.jp
 */
import Cookie                  from '../libs/cookie';
import R                       from '../libs/r';
import Utils                   from '../libs/utils';
import SessionModel, {Session} from '../models/session-model';
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
            const cookie = new Cookie(req, res);
            cookie.clearPassport();

            const session : Session = req['sessionObj'];
            let message;

            if (session.message_id)
            {
                message = R.text(session.message_id);
                session.message_id = null;
                yield SessionModel.update(session);
            }

            res.render('settings', {message});
            log.stepOut();
        })
        .catch ((err) => Utils.internalServerError(err, res, log));
    }

    /**
     * アカウント設定画面
     *
     * @param   req httpリクエスト
     * @param   res httpレスポンス
     */
    static account(req : express.Request, res : express.Response) : void
    {
        const log = slog.stepIn(SettingsController.CLS_NAME, 'account');
        co(function* ()
        {
            res.render('settings-account');
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

    /**
     * 新しいパスワードを入力する画面
     *
     * @param   req httpリクエスト
     * @param   res httpレスポンス
     */
    static password(req : express.Request, res : express.Response) : void
    {
        const log = slog.stepIn(SettingsController.CLS_NAME, 'password');
        co(function* ()
        {
            res.render('settings-account-password');
            log.stepOut();
        })
        .catch ((err) => Utils.internalServerError(err, res, log));
    }
}
