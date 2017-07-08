/**
 * (C) 2016-2017 printf.jp
 */
import * as React          from 'react';
import * as ReactDOM       from 'react-dom/server';

import Root                from 'client/components/root';
import SettingsAccountView from 'client/components/views/settings-account-view';
import {Store}             from 'client/components/views/settings-account-view/store';
import ClientR             from 'client/libs/r';
import {Response}          from 'libs/response';
import SettingsApi         from 'server/api/settings-api';
import {slog}              from 'server/libs/slog';
import Utils               from 'server/libs/utils';
import {view}              from './view';

import express = require('express');

/**
 * settings account app
 */
export default class SettingsAccountApp
{
    private static CLS_NAME = 'SettingsAccountApp';

    /**
     * アカウント設定画面<br>
     * GET /settings/account
     *
     * @param   req httpリクエスト
     * @param   res httpレスポンス
     */
    static async index(req : express.Request, res : express.Response)
    {
        const log = slog.stepIn(SettingsAccountApp.CLS_NAME, 'index');
        const locale = req.ext.locale;

        try
        {
            const data = await SettingsApi.getAccount(req);
            const store : Store =
            {
                locale,
                account:  data.account,
                setAccountResponse: {status:Response.Status.OK, message:{}},
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
}
