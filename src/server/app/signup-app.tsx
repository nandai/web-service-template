/**
 * (C) 2016-2017 printf.jp
 */
import {storeNS}        from 'client/components/views/signup-view/store';
import {slog}           from 'libs/slog';
import SessionAgent     from 'server/agents/session-agent';
import SignupConfirmApp from 'server/app/signup-confirm-app';
import R                from 'server/libs/r';
import Utils            from 'server/libs/utils';
import {Session}        from 'server/models/session';
import {view}           from './view';

import express = require('express');

/**
 * signup app
 */
export default class SignupApp
{
    private static CLS_NAME = 'SignupApp';

    /**
     * GET /signup
     *
     * @param   req httpリクエスト
     * @param   res httpレスポンス
     */
    static async index(req : express.Request, res : express.Response)
    {
        if (Object.keys(req.query).length > 0)
        {
            SignupConfirmApp.index(req, res);
            return;
        }

        const log = slog.stepIn(SignupApp.CLS_NAME, 'index');
        const locale = req.ext.locale;

        try
        {
            const session : Session = req.ext.session;
            let message   : string;

            if (session.message_id)
            {
                message = R.text(session.message_id, locale);
                session.message_id = null;
                await SessionAgent.update(session);
            }

            const store : storeNS.Store = {message};
            res.send(view(req, store));
            log.stepOut();
        }
        catch (err) {Utils.internalServerError(err, res, log);}
    }
}
