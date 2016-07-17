/**
 * (C) 2016 printf.jp
 */
import Cookie                  from '../libs/cookie';
import R                       from '../libs/r';
import Utils                   from '../libs/utils';
import SessionModel, {Session} from '../models/session-model';
import AccountModel, {Account} from '../models/account-model';

import express = require('express');
import slog =    require('../slog');
const co =       require('co');

/**
 * トップコントローラ
 */
export default class TopController
{
    private static CLS_NAME = 'TopController';

    /**
     * @param   req httpリクエスト
     * @param   res httpレスポンス
     */
    static index(req : express.Request, res : express.Response) : void
    {
        const log = slog.stepIn(TopController.CLS_NAME, 'index');
        co(function* ()
        {
            const cookie = new Cookie(req, res);
            cookie.clearPassport();

            const session : Session = req['sessionObj'];
            let message;

            if (session.message_id)
            {
                message = R.text(session.message_id);
                session.message_id = null;
                yield SessionModel.update(session);
            }

            const param = req.query;
            const smsId = param.id;

            if (smsId)
            {
                const account : Account = yield AccountModel.findBySmsId(smsId);

                if (account) res.render('sms', {smsId});
                else         res.status(404).render('404');
            }
            else if (session.account_id === null || message)
            {
                log.d('ログイン画面を表示');
                res.render('login', {message});
            }
            else
            {
                log.d('トップ画面を表示');
                res.render('index');
            }

            log.stepOut();
        })
        .catch ((err) => Utils.internalServerError(err, res, log));
    }
}
