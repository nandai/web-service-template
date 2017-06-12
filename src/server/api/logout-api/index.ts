/**
 * (C) 2016-2017 printf.jp
 */
import {Response}   from 'libs/response';
import SessionAgent from 'server/agents/session-agent';
import Utils        from 'server/libs/utils';
import {Session}    from 'server/models/session-model';

import express = require('express');
import slog =    require('server/slog');

/**
 * ログアウトAPI
 */
export default class LogoutApi
{
    /**
     * ログアウト<br>
     * POST /api/logout
     */
    static async onLogout(req : express.Request, res : express.Response)
    {
        const log = slog.stepIn('LogoutApi', 'onLogout');
        try
        {
            const session : Session = req.ext.session;
            await SessionAgent.logout({sessionId:session.id});

            const data = {status:Response.Status.OK};
            res.json(data);
            log.stepOut();
        }
        catch (err) {Utils.internalServerError(err, res, log);}
    }
}
