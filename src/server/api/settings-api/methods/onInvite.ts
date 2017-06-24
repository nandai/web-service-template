/**
 * (C) 2016-2017 printf.jp
 */
import {Request}    from 'libs/request';
import {Response}   from 'libs/response';
import CommonUtils  from 'libs/utils';
import AccountAgent from 'server/agents/account-agent';
import R            from 'server/libs/r';
import Utils        from 'server/libs/utils';
import Validator    from 'server/libs/validator';
import {Account}    from 'server/models/account';

import express = require('express');
import slog =    require('server/slog');

/**
 * 招待する<br>
 * POST /api/settings/invite
 */
export async function onInvite(req : express.Request, res : express.Response)
{
    const log = slog.stepIn('SettingsApi', 'onInvite');
    try
    {
        do
        {
            const locale = req.ext.locale;
            const param     : Request.Invite = req.body;
            const condition : Request.Invite =
            {
                email: ['string', null, true] as any
            };

            if (Utils.existsParameters(param, condition) === false)
            {
                res.ext.badRequest(locale);
                break;
            }

            const {email} = param;

            // 検証
            let account = await AccountAgent.findByProviderId('email', email);
            const result = await isInviteValid(param, account, locale);

            if (result.status !== Response.Status.OK)
            {
                res.ext.error(result.status, result.message);
                break;
            }

            let status = Response.Status.FAILED;
            let resource : string;

            const invite_id = Utils.createRandomText(32);
            const url = Utils.generateUrl('join', invite_id);
            const template = R.mail(R.NOTICE_INVITE, locale);
            const contents = CommonUtils.formatString(template.contents, {url});
            const sendEmailResult = await Utils.sendMail(template.subject, email, contents);

            if (sendEmailResult)
            {
                status = Response.Status.OK;
                resource = R.INVITE_MAIL_SENDED;

                const name = email.substr(0, email.indexOf('@'));
                account = {name, email, invite_id};
                account = await AccountAgent.add(account);
            }
            else
            {
                resource = R.COULD_NOT_SEND_INVITE_MAIL;
            }

            const message = R.text(resource, locale);
            const data : Response.Invite = {status, message};
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
export function isInviteValid(param : Request.Invite, alreadyExistsAccount : Account, locale : string)
{
    return new Promise(async (resolve : (result : ValidationResult) => void, reject) =>
    {
        const log = slog.stepIn('SignupApi', 'isSignupEmailValid');
        try
        {
            const result : ValidationResult = {status:Response.Status.OK};
            const {email} = param;

            do
            {
                // メールアドレス検証
                const resultEmail = await Validator.email(email, 0, alreadyExistsAccount, locale);

                if (resultEmail.status !== Response.Status.OK)
                {
                    result.status =  resultEmail.status;
                    result.message = resultEmail.message;
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
