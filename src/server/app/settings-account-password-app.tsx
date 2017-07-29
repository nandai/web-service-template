/**
 * (C) 2016-2017 printf.jp
 */
import * as React       from 'react';
import * as ReactDOM    from 'react-dom/server';

import ClientApp        from 'client/app/settings-account-password-app';
import Root             from 'client/components/root';
import ClientR          from 'client/libs/r';
import {slog}           from 'libs/slog';
import SettingsApi      from 'server/api/settings-api';
import Utils            from 'server/libs/utils';
import {notFound, view} from './view';

import express = require('express');

/**
 * settings account password app
 */
export default class SettingsAccountPasswordApp
{
    private static CLS_NAME = 'SettingsAccountPasswordApp';

    /**
     * 新しいパスワードを入力する画面<br>
     * GET /settings/account/password
     *
     * @param   req httpリクエスト
     * @param   res httpレスポンス
     */
    static async index(req : express.Request, res : express.Response)
    {
        const log = slog.stepIn(SettingsAccountPasswordApp.CLS_NAME, 'index');
        const locale = req.ext.locale;

        try
        {
            const data = await SettingsApi.getAccount(req);
            const {account} = data;
            if (account.email)
            {
                const title = ClientR.text(ClientR.SETTINGS_ACCOUNT_PASSWORD, locale);
                const app = new ClientApp({locale, account});
                const contents = ReactDOM.renderToString(<Root app={app} />);
                res.send(view(title, 'wst.js', contents, app.store));
            }
            else
            {
                await notFound(req, res);
            }
            log.stepOut();
        }
        catch (err) {Utils.internalServerError(err, res, log);}
    }
}
