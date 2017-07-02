/**
 * (C) 2016-2017 printf.jp
 */
import {Request}    from 'libs/request';
import {Response}   from 'libs/response';
import AccountAgent from 'server/agents/account-agent';
import R            from 'server/libs/r';
import Utils        from 'server/libs/utils';
import {Session}    from 'server/models/session';

import express = require('express');
import slog =    require('server/slog');

/**
 * 紐づけを解除する<br>
 * PUT /api/settings/account/unlink
 */
export async function onUnlinkProvider(req : express.Request, res : express.Response)
{
    const log = slog.stepIn('SettingsApi', 'onUnlinkProvider');
    try
    {
        do
        {
            const locale = req.ext.locale;
            const param     : Request.UnlinkProvider = req.body;
            const condition : Request.UnlinkProvider =
            {
                provider: ['string', null, true] as any
            };

            if (Utils.existsParameters(param, condition) === false)
            {
                res.ext.badRequest(locale);
                break;
            }

            // プロバイダ名チェック
            const {provider} = param;
            log.d(`${provider}`);

            if (provider !== 'twitter'
            &&  provider !== 'facebook'
            &&  provider !== 'google'
            &&  provider !== 'github')
            {
                res.ext.badRequest(locale);
                break;
            }

            // アカウント更新
            const session : Session = req.ext.session;
            const account = await AccountAgent.find(session.account_id);

            if (AccountAgent.canUnlink(account, provider))
            {
                account[provider] = null;
                await AccountAgent.update(account);

                const response : Response.UnlinkProvider = {status:Response.Status.OK, message:{}};
                res.json(response);
            }
            else
            {
                const response : Response.UnlinkProvider =
                {
                    status: Response.Status.FAILED,
                    message: {general:R.text(R.CANNOT_UNLINK, locale)}
                };
                res.json(response);
            }
        }
        while (false);
        log.stepOut();
    }
    catch (err) {Utils.internalServerError(err, res, log);}
}
