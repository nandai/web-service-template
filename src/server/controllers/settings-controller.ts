/**
 * (C) 2016-2017 printf.jp
 */
import {view, notFound}        from './view';
import Cookie                  from '../libs/cookie';
import R                       from '../libs/r';
import Utils                   from '../libs/utils';
import SessionModel, {Session} from '../models/session-model';
import AccountModel, {Account} from '../models/account-model';
import ClientR                 from 'client/libs/r';

import express = require('express');
import slog =    require('../slog');

/**
 * 設定コントローラ
 */
export default class SettingsController
{
    private static CLS_NAME = 'SettingsController';

    /**
     * 設定画面<br>
     * GET /settings
     *
     * @param   req httpリクエスト
     * @param   res httpレスポンス
     */
    static async index(req : express.Request, res : express.Response)
    {
        const log = slog.stepIn(SettingsController.CLS_NAME, 'index');
        const locale = req.ext.locale;

        try
        {
            const cookie = new Cookie(req, res);
            cookie.clearPassport();

            const session : Session = req.ext.session;
            let message;

            if (session.message_id)
            {
                message = R.text(session.message_id, locale);
                session.message_id = null;
                await SessionModel.update(session);
            }

            const title = ClientR.text(ClientR.SETTINGS, locale);
            res.send(view(title, 'settings.js', message));
            log.stepOut();
        }
        catch (err) {Utils.internalServerError(err, res, log)};
    }

    /**
     * アカウント設定画面<br>
     * GET /settings/account
     *
     * @param   req httpリクエスト
     * @param   res httpレスポンス
     */
    static async account(req : express.Request, res : express.Response)
    {
        const log = slog.stepIn(SettingsController.CLS_NAME, 'account');
        const locale = req.ext.locale;

        try
        {
            const title = ClientR.text(ClientR.SETTINGS_ACCOUNT, locale);
            res.send(view(title, 'settings-account.js'));
            log.stepOut();
        }
        catch (err) {Utils.internalServerError(err, res, log)};
    }

    /**
     * 新しいメールアドレスを入力する画面<br>
     * GET /settings/account/email
     *
     * @param   req httpリクエスト
     * @param   res httpレスポンス
     */
    static async email(req : express.Request, res : express.Response)
    {
        const log = slog.stepIn(SettingsController.CLS_NAME, 'email');
        const locale = req.ext.locale;

        try
        {
            const title = ClientR.text(ClientR.SETTINGS_ACCOUNT_EMAIL, locale);
            res.send(view(title, 'settings-account-email.js'));
            log.stepOut();
        }
        catch (err) {Utils.internalServerError(err, res, log)};
    }

    /**
     * メールアドレス変更メールのリンクから遷移してくる画面<br>
     * GET /settings/account/email/change
     *
     * @param   req httpリクエスト
     * @param   res httpレスポンス
     */
    static async changeEmail(req : express.Request, res : express.Response)
    {
        const log = slog.stepIn(SettingsController.CLS_NAME, 'changeEmail');
        const locale = req.ext.locale;

        try
        {
            const param = req.query;
            const changeId = param.id;
            let account : Account = null;

            if (changeId)
                account = await AccountModel.findByChangeId(changeId);

            if (account)
            {
                const title = ClientR.text(ClientR.SETTINGS_ACCOUNT_EMAIL_CHANGE, locale);
                res.send(view(title, 'settings-account-email-change.js', changeId));
            }
            else
            {
                notFound(res);
            }

            log.stepOut();
        }
        catch (err) {Utils.internalServerError(err, res, log)};
    }

    /**
     * 新しいパスワードを入力する画面<br>
     * GET /settings/account/password
     *
     * @param   req httpリクエスト
     * @param   res httpレスポンス
     */
    static async password(req : express.Request, res : express.Response)
    {
        const log = slog.stepIn(SettingsController.CLS_NAME, 'password');
        const locale = req.ext.locale;

        try
        {
            const title = ClientR.text(ClientR.SETTINGS_ACCOUNT_PASSWORD, locale);
            res.send(view(title, 'settings-account-password.js'));
            log.stepOut();
        }
        catch (err) {Utils.internalServerError(err, res, log)};
    }
}
