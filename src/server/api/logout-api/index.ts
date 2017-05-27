/**
 * (C) 2016-2017 printf.jp
 */
import Utils                   from 'server/libs/utils';
import SessionModel, {Session} from 'server/models/session-model';

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
            await SessionModel.logout({sessionId:session.id});

            const data = {status:0};
            res.json(data);
            log.stepOut();
        }
        catch (err) {Utils.internalServerError(err, res, log);}
    }
}
