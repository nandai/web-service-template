/**
 * (C) 2016-2017 printf.jp
 */
import ClientApp    from 'client/app/home-app';
import {storeNS}    from 'client/components/views/login-view/store';
import {slog}       from 'libs/slog';
import SessionAgent from 'server/agents/session-agent';
import SmsApp       from 'server/app/sms-app';
import TopApp       from 'server/app/top-app';
import Cookie       from 'server/libs/cookie';
import R            from 'server/libs/r';
import Utils        from 'server/libs/utils';
import {Session}    from 'server/models/session';
import {view}       from './view';

import express = require('express');

/**
 * login app
 */
export default class LoginApp
{
    private static CLS_NAME = 'LoginApp';

    /**
     * GET /
     *
     * @param   req httpリクエスト
     * @param   res httpレスポンス
     */
    static async index(req : express.Request, res : express.Response)
    {
        if (Object.keys(req.query).length > 0)
        {
            SmsApp.index(req, res);
            return;
        }

        const session : Session = req.ext.session;
        if (session.account_id && session.sms_id === null)
        {
            TopApp.index(req, res);
            return;
        }

        // ここから本編
        const log = slog.stepIn(LoginApp.CLS_NAME, 'index');
        const locale = req.ext.locale;

        try
        {
            const cookie = new Cookie(req, res);
            cookie.clearPassport();

            const messageId = session.message_id;
            let message : string;

            if (messageId)
            {
                message = R.text(messageId, locale);
                session.message_id = null;
                await SessionAgent.update(session);
            }

            const store : storeNS.Store = {locale, currentUrl:'/', message};
            const app = new ClientApp(store);
            res.send(view(app, '/'));
            log.stepOut();
        }
        catch (err) {Utils.internalServerError(err, res, log);}
    }
}
