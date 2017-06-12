/**
 * (C) 2016-2017 printf.jp
 */
import {Request}    from 'libs/request';
import {Response}   from 'libs/response';
import AccountAgent from 'server/agents/account-agent';
import Config       from 'server/config';
import R            from 'server/libs/r';
import Utils        from 'server/libs/utils';
import {Session}    from 'server/models/session';

import express = require('express');
import slog =    require('server/slog');

/**
 * パスワードを変更する<br>
 * PUT /api/settings/account/password
 */
export async function onChangePassword(req : express.Request, res : express.Response)
{
    const log = slog.stepIn('SettingsApi', 'onChangePassword');
    try
    {
        do
        {
            const locale = req.ext.locale;
            const param     : Request.ChangePassword = req.body;
            const condition : Request.ChangePassword =
            {
                oldPassword: ['string', null, true] as any,
                newPassword: ['string', null, true] as any,
                confirm:     ['string', null, true] as any
            };

            if (Utils.existsParameters(param, condition) === false)
            {
                res.ext.badRequest(locale);
                break;
            }

            const {oldPassword, newPassword, confirm} = param;
            const session : Session = req.ext.session;
            const account = await AccountAgent.find(session.account_id);

            if (account.email === null)
            {
                res.ext.error(Response.Status.FAILED, R.text(R.CANNOT_SET_PASSWORD, locale));
                break;
            }

            if (account.password !== null || oldPassword !== '')
            {
                const hashPassword = Utils.getHashPassword(account.email, oldPassword, Config.PASSWORD_SALT);

                if (hashPassword !== account.password)
                {
                    res.ext.error(Response.Status.FAILED, R.text(R.INVALID_PASSWORD, locale));
                    break;
                }
            }

            if (Utils.validatePassword(newPassword) === false)
            {
                res.ext.error(Response.Status.FAILED, R.text(R.PASSWORD_TOO_SHORT_OR_TOO_LONG, locale));
                break;
            }

            if (newPassword !== confirm)
            {
                res.ext.error(Response.Status.FAILED, R.text(R.MISMATCH_PASSWORD, locale));
                break;
            }

            account.password = Utils.getHashPassword(account.email, newPassword, Config.PASSWORD_SALT);
            await AccountAgent.update(account);

            const data : Response.ChangePassword =
            {
                status:  Response.Status.OK,
                message: R.text(R.PASSWORD_CHANGED, locale)
            };
            res.json(data);
        }
        while (false);
        log.stepOut();
    }
    catch (err) {Utils.internalServerError(err, res, log);}
}
