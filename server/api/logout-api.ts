/**
 * (C) 2016-2017 printf.jp
 */
import Utils from '../libs/utils';
import SessionModel, {Session} from '../models/session-model';

import express = require('express');
import slog =    require('../slog');

/**
 * ログアウトAPI
 */
export default class LogoutApi
{
    private static CLS_NAME = 'LogoutApi';

    /**
     * ログアウト<br>
     * POST /api/logout
     *
     * @param   req httpリクエスト
     * @param   res httpレスポンス
     */
    static async index(req : express.Request, res : express.Response)
    {
        const log = slog.stepIn(LogoutApi.CLS_NAME, 'index');
        try
        {
            const session : Session = req['sessionObj'];
            await SessionModel.logout({sessionId:session.id});

            const data = {status:0};
            res.json(data);
            log.stepOut();
        }
        catch (err) {Utils.internalServerError(err, res, log)};
    }
}
