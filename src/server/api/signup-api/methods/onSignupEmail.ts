/**
 * (C) 2016-2017 printf.jp
 */
import {Request}  from 'libs/request';
import {Response} from 'libs/response';
import Config     from 'server/config';
import R          from 'server/libs/r';
import Utils      from 'server/libs/utils';
import Validator  from 'server/libs/validator';
import Email      from 'server/provider/email';

import express = require('express');
import slog =    require('server/slog');

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

        // 検証
        const result = await isSignupEmailValid(param, locale);

        if (result.status !== Response.Status.OK)
        {
            res.ext.error(result.status, result.message);
            break;
        }

        const {email, password} = param;
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

/**
 * 検証
 */
export function isSignupEmailValid(param : Request.SignupEmail, locale : string)
{
    return new Promise(async (resolve : (result : ValidationResult) => void, reject) =>
    {
        const log = slog.stepIn('SignupApi', 'isSignupEmailValid');
        try
        {
            const result : ValidationResult = {status:Response.Status.OK};
            const {email, password} = param;

            do
            {
                // メールアドレス検証
                if (email === null)
                {
                    result.status = Response.Status.FAILED;
                    result.message = R.text(R.INVALID_EMAIL, locale);
                    break;
                }

                // パスワード検証
                const passwordResult = Validator.password(password, null, locale);

                if (passwordResult.status !== Response.Status.OK)
                {
                    result.status =  passwordResult.status;
                    result.message = passwordResult.message;
                    break;
                }
            }
            while (false);

            if (result.status !== Response.Status.OK) {
                log.w(JSON.stringify(result, null, 2));
            }

            log.stepOut();
            resolve(result);
        }
        catch (err) {log.stepOut(); reject(err);}
    });
}

interface ValidationResult
{
    status   : Response.Status;
    message? : string;
}
