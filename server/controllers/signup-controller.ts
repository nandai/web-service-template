/**
 * (C) 2016 printf.jp
 */
import R                       from '../libs/r';
import Utils                   from '../libs/utils';
import ResponseData            from '../libs/response-data';
import SessionModel, {Session} from '../models/session-model';
import AccountModel, {Account} from '../models/account-model';

import express = require('express');
import slog =    require('../slog');
const co =       require('co');

/**
 * サインアップコントローラ
 */
export default class SignupController
{
    private static CLS_NAME = 'SignupController';

    /**
     * GET /signup
     *
     * @param   req httpリクエスト
     * @param   res httpレスポンス
     */
    static index(req : express.Request, res : express.Response) : void
    {
        const log = slog.stepIn(SignupController.CLS_NAME, 'index');
        co(function* ()
        {
            const param = req.query;
            const signupId = param.id;

            if (signupId === undefined)
            {
                const session : Session = req['sessionObj'];
                let message;

                if (session.message_id)
                {
                    const locale : string = req['locale'];
                    message = R.text(session.message_id, locale);
                    session.message_id = null;
                    yield SessionModel.update(session);
                }

                log.d('サインアップ画面を表示');
                res.render('signup', {message});
            }
            else
            {
                const account : Account = yield AccountModel.findBySignupId(signupId);

                if (account) res.render('signup-confirm', {signupId});
                else         res.status(404).render('404');
            }

            log.stepOut();
        })
        .catch ((err) => Utils.internalServerError(err, res, log));
    }
}
