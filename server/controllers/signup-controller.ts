/**
 * (C) 2016-2017 printf.jp
 */
import {view, notFound}        from './view';
import R                       from '../libs/r';
import Utils                   from '../libs/utils';
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
                const session : Session = req.ext.session;
                let message;

                if (session.message_id)
                {
                    const locale = req.ext.locale;
                    message = R.text(session.message_id, locale);
                    session.message_id = null;
                    await SessionModel.update(session);
                }

                log.d('サインアップ画面を表示');
                res.send(view('サインアップ', 'wst.js', message));
            }
            else
            {
                const account = await AccountModel.findBySignupId(signupId);

                if (account) res.send(view('サインアップの確認', 'signup-confirm.js', signupId));
                else         notFound(res);
            }

            log.stepOut();
        }
        catch (err) {Utils.internalServerError(err, res, log)};
    }
}
