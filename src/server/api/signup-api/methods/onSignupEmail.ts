/**
 * (C) 2016-2017 printf.jp
 */
import {Request}  from 'libs/request';
import {Response} from 'libs/response';
import Config     from 'server/config';
import R          from 'server/libs/r';
import Utils      from 'server/libs/utils';
import Email      from 'server/provider/email';

import express = require('express');
import slog =    require('server/slog');

/**
 * メールアドレスでサインアップする<br>
 * POST /api/signup/email
 */
export function onSignupEmail(req : express.Request, res : express.Response) : void
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

        if (Utils.validatePassword(password) === false)
        {
            res.ext.error(Response.Status.FAILED, R.text(R.INVALID_EMAIL_AUTH, locale));
            break;
        }

        const hashPassword = Utils.getHashPassword(email, password, Config.PASSWORD_SALT);
        process.nextTick(() =>
        {
            Email.verify(email, hashPassword, (err, user) =>
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
