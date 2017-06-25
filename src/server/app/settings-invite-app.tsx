/**
 * (C) 2016-2017 printf.jp
 */
import * as React         from 'react';
import * as ReactDOM      from 'react-dom/server';

import Root               from 'client/components/root';
import SettingsInviteView from 'client/components/views/settings-invite-view';
import {Store}            from 'client/components/views/settings-invite-view/store';
import ClientR            from 'client/libs/r';
import {Response}         from 'libs/response';
import SettingsApi        from '../api/settings-api';
import Utils              from '../libs/utils';
import {view}             from './view';

import express = require('express');
import slog =    require('../slog');

/**
 * settings invite app
 */
export default class SettingsInviteApp
{
    private static CLS_NAME = 'SettingsInviteApp';

    /**
     * 招待する画面<br>
     * GET /settings/invite
     *
     * @param   req httpリクエスト
     * @param   res httpレスポンス
     */
    static async index(req : express.Request, res : express.Response)
    {
        const log = slog.stepIn(SettingsInviteApp.CLS_NAME, 'index');
        const locale = req.ext.locale;

        try
        {
            const data = await SettingsApi.getAccount(req);
            const store : Store =
            {
                locale,
                account: data.account,
                email:   '',
                inviteResponse: {status:Response.Status.OK, message:{}}
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
