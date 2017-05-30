/**
 * (C) 2016-2017 printf.jp
 */
import {Request}    from 'libs/request';
import {Response}   from 'libs/response';
import Config       from 'server/config';
import R            from 'server/libs/r';
import Utils        from 'server/libs/utils';
import AccountModel from 'server/models/account-model';

import express = require('express');
import slog =    require('server/slog');

/**
 * メールアドレスでのサインアップを確定する<br>
 * POST /api/signup/email/confirm
 */
export async function onConfirmSignupEmail(req : express.Request, res : express.Response)
{
    const log = slog.stepIn('SignupApi', 'onConfirmSignupEmail');
    try
    {
        do
        {
            const locale = req.ext.locale;
            const param     : Request.ConfirmSignupEmail = req.body;
            const condition : Request.ConfirmSignupEmail =
            {
                signupId: ['string', null, true],
                password: ['string', null, true]
            };

            if (Utils.existsParameters(param, condition) === false)
            {
                res.ext.badRequest(locale);
                break;
            }

            const signupId = <string>param.signupId;
            const password = <string>param.password;

            const account = await AccountModel.findBySignupId(signupId);
            if (account === null)
            {
                // サインアップの確認画面でサインアップを完了させた後、再度サインアップを完了させようとした場合にここに到達する想定。
                // サインアップIDで該当するアカウントがないということが必ずしもサインアップ済みを意味するわけではないが、
                // 第三者が直接このAPIをコールするなど、想定以外のケースでなければありえないので、登録済みというメッセージでOK。
                res.ext.error(Response.Status.FAILED, R.text(R.ALREADY_SIGNUP, locale));
                break;
            }

            const hashPassword = Utils.getHashPassword(account.email, password, Config.PASSWORD_SALT);

            if (account.password !== hashPassword)
            {
                res.ext.error(Response.Status.FAILED, R.text(R.INVALID_EMAIL_AUTH, locale));
                break;
            }

            account.signup_id = null;
            account.invite_id = null;
            await AccountModel.update(account);

            const data : Response.ConfirmSignupEmail =
            {
                status:  Response.Status.OK,
                message: R.text(R.SIGNUP_COMPLETED, locale)
            };
            res.json(data);
        }
        while (false);
        log.stepOut();
    }
    catch (err) {Utils.internalServerError(err, res, log);}
}
