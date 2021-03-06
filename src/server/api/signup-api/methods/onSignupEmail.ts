/**
 * (C) 2016-2017 printf.jp
 */
import {Request}    from 'libs/request';
import {Response}   from 'libs/response';
import {slog}       from 'libs/slog';
import AccountAgent from 'server/agents/account-agent';
import Config       from 'server/config';
import Utils        from 'server/libs/utils';
import Validator    from 'server/libs/validator';
import {Account}    from 'server/models/account';
import Email        from 'server/provider/email';

import express = require('express');

/**
 * メールアドレスでサインアップする<br>
 * POST /api/signup/email
 */
export async function onSignupEmail(req : express.Request, res : express.Response)
{
    const log = slog.stepIn('SignupApi', 'onSignupEmail');
    do
    {
        const locale = req.ext.locale;
        const param     : Request.SignupEmail = req.body;
        const condition : Request.SignupEmail =
        {
            email:    ['string', null, true] as any,
            password: ['string', null, true] as any
        };

        if (Utils.existsParameters(param, condition) === false)
        {
            res.ext.badRequest(locale);
            break;
        }

        const {email, password} = param;

        // 検証
        const alreadyExistsAccount = await AccountAgent.findByProviderId('email', param.email);
        const result = await isSignupEmailValid(param, alreadyExistsAccount, locale);

        if (result.response.status !== Response.Status.OK)
        {
            res.json(result.response);
            break;
        }

        process.nextTick(() =>
        {
            const hashPassword = Utils.getHashPassword(email, password, Config.PASSWORD_SALT);
            Email.verify(email, hashPassword, (_err, user) =>
            {
                req.ext.command = 'signup';
                req.user = user;
                Email.callback(req, res);
            });
        });
    }
    while (false);
    log.stepOut();
}

/**
 * 検証
 */
export async function isSignupEmailValid(param : Request.SignupEmail, alreadyExistsAccount : Account, locale : string) : Promise<ValidationResult>
{
    const log = slog.stepIn('SignupApi', 'isSignupEmailValid');
    const response : Response.SignupEmail = {status:Response.Status.OK, message:{}};
    const {email, password} = param;

    do
    {
        // メールアドレス検証
        const resultEmail = await Validator.email(email, 0, alreadyExistsAccount, locale);

        if (resultEmail.status !== Response.Status.OK)
        {
            response.status =        resultEmail.status;
            response.message.email = resultEmail.message;
        }

        // パスワード検証
        const passwordResult = Validator.password({password}, locale);

        if (passwordResult.status !== Response.Status.OK)
        {
            response.status =           passwordResult.status;
            response.message.password = passwordResult.password;
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
    response : Response.SignupEmail;
}
