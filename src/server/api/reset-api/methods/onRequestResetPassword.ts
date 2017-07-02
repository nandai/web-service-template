/**
 * (C) 2016-2017 printf.jp
 */
import {Request}    from 'libs/request';
import {Response}   from 'libs/response';
import CommonUtils  from 'libs/utils';
import AccountAgent from 'server/agents/account-agent';
import R            from 'server/libs/r';
import Utils        from 'server/libs/utils';

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
                email: ['string', null, true] as any
            };

            if (Utils.existsParameters(param, condition) === false)
            {
                res.ext.badRequest(locale);
                break;
            }

            const response : Response.RequestResetPassword = {status:Response.Status.FAILED, message:{}};
            const account = await AccountAgent.findByProviderId('email', param.email);
            if (account === null || account.signup_id)
            {
                response.message.email = R.text(R.INVALID_EMAIL, locale);
                res.json(response);
                break;
            }

            account.reset_id = Utils.createRandomText(32);
            await AccountAgent.update(account);

            const url = Utils.generateUrl('reset', account.reset_id);
            const template = R.mail(R.NOTICE_RESET_PASSWORD, locale);
            const contents = CommonUtils.formatString(template.contents, {url});
            const result = await Utils.sendMail(template.subject, account.email, contents);

            if (result)
            {
                response.status = Response.Status.OK;
                response.message.general = R.text(R.RESET_MAIL_SENDED, locale);
            }
            else
            {
                response.message.email = R.text(R.COULD_NOT_SEND_RESET_MAIL, locale);
            }

            res.json(response);
        }
        while (false);
        log.stepOut();
    }
    catch (err) {Utils.internalServerError(err, res, log);}
}
