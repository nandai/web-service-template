/**
 * (C) 2016-2017 printf.jp
 */
import R                       from '../libs/r';
import Utils                   from '../libs/utils';
import ResponseData            from '../libs/response-data';
import SessionModel, {Session} from '../models/session-model';
import AccountModel, {Account} from '../models/account-model';

import express = require('express');
import slog =    require('../slog');

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
    static async index(req : express.Request, res : express.Response)
    {
        const log = slog.stepIn(SignupController.CLS_NAME, 'index');
        try
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
                    await SessionModel.update(session);
                }

                log.d('サインアップ画面を表示');
                res.render('signup', {message});
            }
            else
            {
                const account = await AccountModel.findBySignupId(signupId);

                if (account) res.render('signup-confirm', {signupId});
                else         res.status(404).render('404');
            }

            log.stepOut();
        }
        catch (err) {Utils.internalServerError(err, res, log)};
    }
}
