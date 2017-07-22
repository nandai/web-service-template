/**
 * (C) 2016-2017 printf.jp
 */
import {Request}    from 'libs/request';
import {Response}   from 'libs/response';
import {slog}       from 'libs/slog';
import AccountAgent from 'server/agents/account-agent';
import Config       from 'server/config';
import R            from 'server/libs/r';
import Utils        from 'server/libs/utils';
import {Account}    from 'server/models/account';

import express = require('express');

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
                signupId: ['string', null, true] as any,
                password: ['string', null, true] as any
            };

            if (Utils.existsParameters(param, condition) === false)
            {
                res.ext.badRequest(locale);
                break;
            }

            // 検証
            const account = await AccountAgent.findBySignupId(param.signupId);
            const result = isConfirmSignupEmailValid(param, account, locale);

            if (result.response.status !== Response.Status.OK)
            {
                res.json(result.response);
                break;
            }

            // 更新
            account.signup_id = null;
            account.invite_id = null;
            await AccountAgent.update(account);

            // 送信
            const data : Response.ConfirmSignupEmail =
            {
                status:  Response.Status.OK,
                message: {general:R.text(R.SIGNUP_COMPLETED, locale)}
            };
            res.json(data);
        }
        while (false);
        log.stepOut();
    }
    catch (err) {Utils.internalServerError(err, res, log);}
}

/**
 * 検証
 */
export function isConfirmSignupEmailValid(param : Request.ConfirmSignupEmail, account : Account, locale : string) : ValidationResult
{
    const log = slog.stepIn('SignupApi', 'isConfirmSignupEmailValid');
    const response : Response.ConfirmSignupEmail = {status:Response.Status.OK, message:{}};

    do
    {
        if (account === null)
        {
            // サインアップの確認画面でサインアップを完了させた後、再度サインアップを完了させようとした場合にここに到達する想定。
            // サインアップIDで該当するアカウントがないということが必ずしもサインアップ済みを意味するわけではないが、
            // 第三者が直接このAPIをコールするなど、想定以外のケースでなければありえないので、登録済みというメッセージでOK。
            response.status = Response.Status.FAILED;
            response.message.general = R.text(R.ALREADY_SIGNUP, locale);
            break;
        }

        const hashPassword = Utils.getHashPassword(account.email, param.password, Config.PASSWORD_SALT);

        if (account.password !== hashPassword)
        {
            response.status = Response.Status.FAILED;
            response.message.password = R.text(R.INVALID_PASSWORD, locale);
        }
    }
    while (false);

    if (response.status !== Response.Status.OK) {
        log.w(JSON.stringify(response, null, 2));
    }

    log.stepOut();
    return {response};
}

interface ValidationResult
{
    response : Response.ConfirmSignupEmail;
}
