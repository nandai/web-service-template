/**
 * (C) 2016-2017 printf.jp
 */
import * as React                                 from 'react';
import * as ReactDOM                              from 'react-dom/server';

import Root                                       from 'client/components/root';
import SettingsAccountEmailChangeView             from 'client/components/views/settings-account-email-change-view/settings-account-email-change-view';
import {Store as SettingsAccountEmailChangeStore} from 'client/components/views/settings-account-email-change-view/store';
import SettingsAccountEmailView                   from 'client/components/views/settings-account-email-view/settings-account-email-view';
import {Store as SettingsAccountEmailStore}       from 'client/components/views/settings-account-email-view/store';
import SettingsAccountPasswordView                from 'client/components/views/settings-account-password-view/settings-account-password-view';
import {Store as SettingsAccountPasswordStore}    from 'client/components/views/settings-account-password-view/store';
import SettingsAccountView                        from 'client/components/views/settings-account-view/settings-account-view';
import {Store as SettingsAccountStore}            from 'client/components/views/settings-account-view/store';
import SettingsInviteView                         from 'client/components/views/settings-invite-view/settings-invite-view';
import {Store as SettingsInviteStore}             from 'client/components/views/settings-invite-view/store';
import SettingsView                               from 'client/components/views/settings-view/settings-view';
import {Store as SettingsStore}                   from 'client/components/views/settings-view/store';
import ClientR                                    from 'client/libs/r';
import {Response}                                 from 'libs/response';
import SettingsApi                                from '../api/settings-api';
import Cookie                                     from '../libs/cookie';
import R                                          from '../libs/r';
import Utils                                      from '../libs/utils';
import AccountModel, {Account}                    from '../models/account-model';
import SessionModel, {Session}                    from '../models/session-model';
import {notFound, view}                           from './view';

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
            let message : string;

            if (session.message_id)
            {
                message = R.text(session.message_id, locale);
                session.message_id = null;
                await SessionModel.update(session);
            }

            const data = await SettingsApi.getAccount(req);
            const store : SettingsStore =
            {
                locale,
                account: data.account,
                message
            };

            const title = ClientR.text(ClientR.SETTINGS, locale);
            const el = <SettingsView store={store} />;
            const contents = ReactDOM.renderToString(<Root view={el} />);
            res.send(view(title, 'wst.js', contents, store));
            log.stepOut();
        }
        catch (err) {Utils.internalServerError(err, res, log);}
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
            const data = await SettingsApi.getAccount(req);
            const store : SettingsAccountStore =
            {
                locale,
                account:  data.account,
                message:  ''
            };

            const title = ClientR.text(ClientR.SETTINGS_ACCOUNT, locale);
            const el = <SettingsAccountView store={store} />;
            const contents = ReactDOM.renderToString(<Root view={el} />);
            res.send(view(title, 'wst.js', contents, store));
            log.stepOut();
        }
        catch (err) {Utils.internalServerError(err, res, log);}
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
            const data = await SettingsApi.getAccount(req);
            const store : SettingsAccountEmailStore =
            {
                locale,
                account: data.account,
                message: ''
            };

            const title = ClientR.text(ClientR.SETTINGS_ACCOUNT_EMAIL, locale);
            const el = <SettingsAccountEmailView store={store} />;
            const contents = ReactDOM.renderToString(<Root view={el} />);
            res.send(view(title, 'wst.js', contents, store));
            log.stepOut();
        }
        catch (err) {Utils.internalServerError(err, res, log);}
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

            if (changeId) {
                account = await AccountModel.findByChangeId(changeId);
            }

            if (account)
            {
                const store : SettingsAccountEmailChangeStore =
                {
                    locale,
                    password: '',
                    message:  ''
                };

                const title = ClientR.text(ClientR.SETTINGS_ACCOUNT_EMAIL_CHANGE, locale);
                const el = <SettingsAccountEmailChangeView store={store} />;
                const contents = ReactDOM.renderToString(<Root view={el} />);
                res.send(view(title, 'wst.js', contents));
            }
            else
            {
                notFound(req, res);
            }

            log.stepOut();
        }
        catch (err) {Utils.internalServerError(err, res, log);}
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
            const data = await SettingsApi.getAccount(req);
            if (data.account.email)
            {
                const store : SettingsAccountPasswordStore =
                {
                    locale,
                    account:     data.account,
                    oldPassword: '',
                    newPassword: '',
                    confirm:     '',
                    message:     ''
                };

                const title = ClientR.text(ClientR.SETTINGS_ACCOUNT_PASSWORD, locale);
                const el = <SettingsAccountPasswordView store={store} />;
                const contents = ReactDOM.renderToString(<Root view={el} />);
                res.send(view(title, 'wst.js', contents, store));
            }
            else
            {
                notFound(req, res);
            }
            log.stepOut();
        }
        catch (err) {Utils.internalServerError(err, res, log);}
    }

    /**
     * 招待する画面<br>
     * GET /settings/invite
     *
     * @param   req httpリクエスト
     * @param   res httpレスポンス
     */
    static async invite(req : express.Request, res : express.Response)
    {
        const log = slog.stepIn(SettingsController.CLS_NAME, 'invite');
        const locale = req.ext.locale;

        try
        {
            const data = await SettingsApi.getAccount(req);
            const store : SettingsInviteStore =
            {
                locale,
                account: data.account,
                email:   '',
                message: ''
            };

            const title = ClientR.text(ClientR.SETTINGS_INVITE, locale);
            const el = <SettingsInviteView store={store} />;
            const contents = ReactDOM.renderToString(<Root view={el} />);
            res.send(view(title, 'wst.js', contents, store));
            log.stepOut();
        }
        catch (err) {Utils.internalServerError(err, res, log);}
    }
}
