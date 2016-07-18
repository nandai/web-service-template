/**
 * (C) 2016 printf.jp
 */
import Utils from '../libs/utils';
import SessionModel, {Session} from '../models/session-model';

import express = require('express');
import slog =    require('../slog');
const co =       require('co');

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
    static index(req : express.Request, res : express.Response) : void
    {
        const log = slog.stepIn(LogoutApi.CLS_NAME, 'index');
        co(function* ()
        {
            const session : Session = req['sessionObj'];
            yield SessionModel.logout({sessionId:session.id});

            const data = {status:0};
            res.json(data);
            log.stepOut();
        })
        .catch ((err) => Utils.internalServerError(err, res, log));
    }
}
