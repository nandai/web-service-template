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

            // 検証
            const account = await AccountAgent.findByProviderId('email', param.email);
            const result = await isInviteValid(param, account, locale);

            if (result.response.status !== Response.Status.OK)
            {
                res.json(result.response);
                break;
            }

            // 実行
            const response = await execInvite(param, locale);
            res.json(response);
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
        const log = slog.stepIn('SettingsApi', 'isInviteValid');
        try
        {
            const response : Response.Invite = {status:Response.Status.OK, message:{}};
            const {email} = param;

            do
            {
                // メールアドレス検証
                const resultEmail = await Validator.email(email, 0, alreadyExistsAccount, locale);

                if (resultEmail.status !== Response.Status.OK)
                {
                    response.status =        resultEmail.status;
                    response.message.email = resultEmail.message;
                }
            }
            while (false);

            if (response.status !== Response.Status.OK) {
                log.w(JSON.stringify(response, null, 2));
            }

            log.stepOut();
            resolve({response});
        }
        catch (err) {log.stepOut(); reject(err);}
    });
}

/**
 * 実行
 */
function execInvite(param : Request.Invite, locale : string)
{
    return new Promise(async (resolve : (response : Response.Invite) => void, reject) =>
    {
        const log = slog.stepIn('SettingsApi', 'execInvite');
        try
        {
            const response : Response.Invite = {status:Response.Status.FAILED, message:{}};
            const {email} = param;

            const invite_id = Utils.createRandomText(32);
            const url = Utils.generateUrl('join', invite_id);
            const template = R.mail(R.NOTICE_INVITE, locale);
            const contents = CommonUtils.formatString(template.contents, {url});
            const result = await Utils.sendMail(template.subject, email, contents);

            if (result)
            {
                response.status = Response.Status.OK;
                response.message.success = R.text(R.INVITE_MAIL_SENDED, locale);

                const name = email.substr(0, email.indexOf('@'));
                const account : Account = {name, email, invite_id};
                await AccountAgent.add(account);
            }
            else
            {
                response.message.email = R.text(R.COULD_NOT_SEND_INVITE_MAIL, locale);
            }

            log.stepOut();
            resolve(response);
        }
        catch (err) {log.stepOut(); reject(err);}
    });
}

interface ValidationResult
{
    response : Response.Invite;
}
