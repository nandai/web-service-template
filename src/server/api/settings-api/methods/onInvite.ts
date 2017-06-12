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

            let account = await AccountAgent.findByProviderId('email', email);
            let status = Response.Status.FAILED;
            let resource : string;

            if (account === null)
            {
                const invite_id = Utils.createRandomText(32);
                const url = Utils.generateUrl('join', invite_id);
                const template = R.mail(R.NOTICE_INVITE, locale);
                const contents = CommonUtils.formatString(template.contents, {url});
                const result = await Utils.sendMail(template.subject, email, contents);

                if (result)
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
            }
            else
            {
                resource = R.ALREADY_EXISTS_EMAIL;
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
