/**
 * (C) 2016-2017 printf.jp
 */
import * as React               from 'react';
import * as ReactDOM            from 'react-dom/server';

import Root                     from 'client/components/root';
import SettingsAccountEmailView from 'client/components/views/settings-account-email-view';
import {Store}                  from 'client/components/views/settings-account-email-view/store';
import ClientR                  from 'client/libs/r';
import {Response}               from 'libs/response';
import SettingsApi              from '../api/settings-api';
import Utils                    from '../libs/utils';
import {view}                   from './view';

import express = require('express');
import slog =    require('../slog');

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
            const store : Store =
            {
                locale,
                account: data.account,
                requestChangeEmailResponse: {status:Response.Status.OK, message:{}},
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
}
