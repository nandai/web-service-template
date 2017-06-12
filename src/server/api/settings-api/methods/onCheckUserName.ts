/**
 * (C) 2016-2017 printf.jp
 */
import {Request}    from 'libs/request';
import {Response}   from 'libs/response';
import AccountAgent from 'server/agents/account-agent';
import R            from 'server/libs/r';
import Utils        from 'server/libs/utils';
import Validator    from 'server/libs/validator';
import {Session}    from 'server/models/session';

import express = require('express');
import slog =    require('server/slog');

/**
 * ユーザー名チェック<br>
 * GET /api/settings/account/username
 */
export async function onCheckUserName(req : express.Request, res : express.Response)
{
    const log = slog.stepIn('SettingsApi', 'onCheckUserName');
    try
    {
        do
        {
            const locale = req.ext.locale;
            const param     : Request.CheckUserName = req.query;
            const condition : Request.CheckUserName =
            {
                userName: ['string', null, true] as any
            };

            if (Utils.existsParameters(param, condition) === false)
            {
                res.ext.badRequest(locale);
                break;
            }

            const {userName} = param;

            // 検証
            const session : Session = req.ext.session;
            const alreadyExistsAccount = await AccountAgent.findByUserName(userName);
            const result = Validator.userName(userName, session.account_id, alreadyExistsAccount, locale);

            if (result.status !== Response.Status.OK)
            {
                res.ext.error(result.status, result.message);
                break;
            }

            const message = (userName ? R.text(R.CAN_USE_USER_NAME, locale) : '');
            const data : Response.CheckUserName =
            {
                status: Response.Status.OK,
                message
            };
            res.json(data);
        }
        while (false);
        log.stepOut();
    }
    catch (err) {Utils.internalServerError(err, res, log);}
}
