/**
 * (C) 2016-2017 printf.jp
 */
import {Request}    from 'libs/request';
import {Response}   from 'libs/response';
import AccountAgent from 'server/agents/account-agent';
import Config       from 'server/config';
import R            from 'server/libs/r';
import Utils        from 'server/libs/utils';
import Email        from 'server/provider/email';

import express = require('express');
import slog =    require('server/slog');

/**
 * メールアドレスでログインする<br>
 * POST /api/login/email
 */
export async function onLoginEmail(req : express.Request, res : express.Response)
{
    const log = slog.stepIn('LoginApi', 'onLoginEmail');
    try
    {
        do
        {
            const locale = req.ext.locale;
            const param     : Request.LoginEmail = req.body;
            const condition : Request.LoginEmail =
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
            const account = await AccountAgent.findByProviderId('email', email);
            let hashPassword : string;

            if (account) {
                hashPassword = Utils.getHashPassword(email, password, Config.PASSWORD_SALT);
            }

            if (account === null || account.password !== hashPassword || account.signup_id)
            {
                const response : Response.LoginEmail =
                {
                    status: Response.Status.FAILED,
                    message: {general:R.text(R.INVALID_EMAIL_AUTH, locale)}
                };
                res.json(response);
                break;
            }

            process.nextTick(() =>
            {
                Email.verify(email, hashPassword, (err, user) =>
                {
                    req.ext.command = 'login';
                    req.user = user;
                    Email.callback(req, res);
                });
            });
        }
        while (false);
        log.stepOut();
    }
    catch (err) {Utils.internalServerError(err, res, log);}
}
