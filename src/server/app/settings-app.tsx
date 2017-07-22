/**
 * (C) 2016-2017 printf.jp
 */
import * as React    from 'react';
import * as ReactDOM from 'react-dom/server';

import Root          from 'client/components/root';
import SettingsView  from 'client/components/views/settings-view';
import {Store}       from 'client/components/views/settings-view/store';
import ClientR       from 'client/libs/r';
import {Response}    from 'libs/response';
import {slog}        from 'libs/slog';
import SessionAgent  from 'server/agents/session-agent';
import SettingsApi   from 'server/api/settings-api';
import Cookie        from 'server/libs/cookie';
import R             from 'server/libs/r';
import Utils         from 'server/libs/utils';
import {Session}     from 'server/models/session';
import {view}        from './view';

import express = require('express');

/**
 * settings app
 */
export default class SettingsApp
{
    private static CLS_NAME = 'SettingsApp';

    /**
     * 設定画面<br>
     * GET /settings
     *
     * @param   req httpリクエスト
     * @param   res httpレスポンス
     */
    static async index(req : express.Request, res : express.Response)
    {
        const log = slog.stepIn(SettingsApp.CLS_NAME, 'index');
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
                await SessionAgent.update(session);
            }

            const data = await SettingsApi.getAccount(req);
            const store : Store =
            {
                locale,
                account: data.account,
                unlinkProviderResponse: {status:Response.Status.OK, message:{}},
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
}
