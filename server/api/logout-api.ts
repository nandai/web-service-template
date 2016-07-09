/**
 * (C) 2016 printf.jp
 */
import Cookie from '../libs/cookie';
import Utils  from '../libs/utils';
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
            const cookie = new Cookie(req, res);
            const sessionId = cookie.sessionId;

            yield SessionModel.remove({sessionId});
            cookie.sessionId = null;

            const data = {status:0};
            res.json(data);
            log.stepOut();
        })
        .catch ((err) => Utils.internalServerError(err, res, log));
    }
}
