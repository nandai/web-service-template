/**
 * (C) 2016-2017 printf.jp
 */
import * as React    from 'react';
import * as ReactDOM from 'react-dom/server';

import ClientApp     from 'client/app/settings-account-email-app';
import Root          from 'client/components/root';
import ClientR       from 'client/libs/r';
import {slog}        from 'libs/slog';
import SettingsApi   from 'server/api/settings-api';
import Utils         from 'server/libs/utils';
import {view}        from './view';

import express = require('express');

/**
 * settings account email app
 */
export default class SettingsAccountEmailApp
{
    private static CLS_NAME = 'SettingsAccountEmailApp';

    /**
     * 新しいメールアドレスを入力する画面<br>
     * GET /settings/account/email
     *
     * @param   req httpリクエスト
     * @param   res httpレスポンス
     */
    static async index(req : express.Request, res : express.Response)
    {
        const log = slog.stepIn(SettingsAccountEmailApp.CLS_NAME, 'index');
        const locale = req.ext.locale;

        try
        {
            const data = await SettingsApi.getAccount(req);
            const {account} = data;
            const title = ClientR.text(ClientR.SETTINGS_ACCOUNT_EMAIL, locale);
            const app = new ClientApp({locale, account});
            const contents = ReactDOM.renderToString(<Root app={app} />);
            res.send(view(title, 'wst.js', contents, app.store));
            log.stepOut();
        }
        catch (err) {Utils.internalServerError(err, res, log);}
    }
}
