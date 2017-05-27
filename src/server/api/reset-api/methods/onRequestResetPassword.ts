/**
 * (C) 2016-2017 printf.jp
 */
import {Request}    from 'libs/request';
import {Response}   from 'libs/response';
import R            from 'server/libs/r';
import Utils        from 'server/libs/utils';
import AccountModel from 'server/models/account-model';

import express = require('express');
import slog =    require('server/slog');

/**
 * パスワードのリセットを要求する<br>
 * POST /api/reset
 */
export async function onRequestResetPassword(req : express.Request, res : express.Response)
{
    const log = slog.stepIn('ResetApi', 'onRequestResetPassword');
    try
    {
        do
        {
            const locale = req.ext.locale;
            const param     : Request.RequestResetPassword = req.body;
            const condition : Request.RequestResetPassword =
            {
                email: ['string', null, true]
            };

            if (Utils.existsParameters(param, condition) === false)
            {
                res.ext.badRequest(locale);
                break;
            }

            const email = <string>param.email;

            const account = await AccountModel.findByProviderId('email', email);
            if (account === null || account.signup_id)
            {
                res.ext.error(Response.Status.FAILED, R.text(R.INVALID_EMAIL, locale));
                break;
            }

            account.reset_id = Utils.createRandomText(32);
            await AccountModel.update(account);

            const url = Utils.generateUrl('reset', account.reset_id);
            const template = R.mail(R.NOTICE_RESET_PASSWORD, locale);
            const contents = Utils.formatString(template.contents, {url});
            const result = await Utils.sendMail(template.subject, account.email, contents);

            const data : Response.RequestResetPassword =
            {
                status:  1,
                message: R.text(result ? R.RESET_MAIL_SENDED : R.COULD_NOT_SEND_RESET_MAIL, locale)
            };
            res.json(data);
        }
        while (false);
        log.stepOut();
    }
    catch (err) {Utils.internalServerError(err, res, log);}
}
