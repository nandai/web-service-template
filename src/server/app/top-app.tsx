/**
 * (C) 2016-2017 printf.jp
 */
import ClientApp    from 'client/app/top-app';
import {slog}       from 'libs/slog';
import SessionAgent from 'server/agents/session-agent';
import SettingsApi  from 'server/api/settings-api';
import R            from 'server/libs/r';
import Utils        from 'server/libs/utils';
import {Session}    from 'server/models/session';
import {view}       from './view';

import express = require('express');

/**
 * top App
 */
export default class TopApp
{
    /**
     * GET /
     *
     * @param   req httpリクエスト
     * @param   res httpレスポンス
     */
    static async index(req : express.Request, res : express.Response)
    {
        const log = slog.stepIn('TopApp', 'index');
        const locale = req.ext.locale;

        try
        {
            const session : Session = req.ext.session;
            const messageId = session.message_id;
            let message : string;

            if (messageId)
            {
                message = R.text(messageId, locale);
                session.message_id = null;
                await SessionAgent.update(session);
            }

            const data = await SettingsApi.getAccount(req);
            const {account} = data;
            const app = new ClientApp({locale, account, message});
            res.send(view(app));
            log.stepOut();
        }
        catch (err) {Utils.internalServerError(err, res, log);}
    }
}
