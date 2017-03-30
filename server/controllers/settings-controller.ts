/**
 * (C) 2016-2017 printf.jp
 */
import {view}                  from './view';
import Cookie                  from '../libs/cookie';
import R                       from '../libs/r';
import Utils                   from '../libs/utils';
import SessionModel, {Session} from '../models/session-model';
import AccountModel, {Account} from '../models/account-model';

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
        try
        {
            const cookie = new Cookie(req, res);
            cookie.clearPassport();

            const session : Session = req['sessionObj'];
            let message;

            if (session.message_id)
            {
                const locale : string = req['locale'];
                message = R.text(session.message_id, locale);
                session.message_id = null;
                await SessionModel.update(session);
            }

            res.send(view('設定', 'settings.js', message));
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
        try
        {
            res.send(view('アカウントの設定', 'settings-account.js'));
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
        try
        {
            res.send(view('メールアドレスの設定', 'settings-account-email.js'));
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
        try
        {
            const param = req.query;
            const changeId = param.id;
            let account : Account = null;

            if (changeId)
                account = await AccountModel.findByChangeId(changeId);

            if (account) res.render('settings-account-email-change', {changeId});
            else         res.status(404).render('404');

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
        try
        {
            res.render('settings-account-password');
            log.stepOut();
        }
        catch (err) {Utils.internalServerError(err, res, log)};
    }
}
