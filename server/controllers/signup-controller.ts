/**
 * (C) 2016 printf.jp
 */
import Cookie       from '../libs/cookie';
import R            from '../libs/r';
import Utils        from '../libs/utils';
import ResponseData from '../libs/response-data';
import AccountModel, {Account} from '../models/account-model';

import express = require('express');
const co =       require('co');
const slog =     require('../slog');

/**
 * サインアップコントローラ
 */
export default class SignupController
{
    private static CLS_NAME = 'SignupController';

    /**
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
                const cookie = new Cookie(req, res);

                let    message;
                const  messageId = cookie.messageId;
                cookie.messageId = null;

                switch (messageId)
                {
                    case Cookie.MESSAGE_ALREADY_SIGNUP:
                        message = R.text(R.ALREADY_SIGNUP);
                        break;

                    case Cookie.MESSAGE_CANNOT_SIGNUP:
                        message = R.text(R.CANNOT_SIGNUP);
                        break;
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
