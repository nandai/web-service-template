/**
 * (C) 2016-2017 printf.jp
 */
import {Request}    from 'libs/request';
import {Response}   from 'libs/response';
import Config       from 'server/config';
import R            from 'server/libs/r';
import Utils        from 'server/libs/utils';
import AccountModel from 'server/models/account-model';
import {Session}    from 'server/models/session-model';

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
                oldPassword: ['string', null, true],
                newPassword: ['string', null, true],
                confirm:     ['string', null, true]
            };

            if (Utils.existsParameters(param, condition) === false)
            {
                res.ext.badRequest(locale);
                break;
            }

            const oldPassword = <string>param.oldPassword;
            const newPassword = <string>param.newPassword;
            const confirm =     <string>param.confirm;

            const session : Session = req.ext.session;
            const account = await AccountModel.find(session.account_id);

            if (account.email === null)
            {
                res.ext.error(Response.Status.FAILED, R.text(R.CANNOT_SET_PASSWORD, locale));
                break;
            }

            if (account.password !== null || param.oldPassword !== '')
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

            if (param.newPassword !== confirm)
            {
                res.ext.error(Response.Status.FAILED, R.text(R.MISMATCH_PASSWORD, locale));
                break;
            }

            account.password = Utils.getHashPassword(account.email, param.newPassword, Config.PASSWORD_SALT);
            await AccountModel.update(account);

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
