/**
 * (C) 2016-2017 printf.jp
 */
import {Request}    from 'libs/request';
import {Response}   from 'libs/response';
import R            from 'server/libs/r';
import Utils        from 'server/libs/utils';
import AccountModel from 'server/models/account-model';
import {Session}    from 'server/models/session-model';

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
                provider: ['string', null, true]
            };

            if (Utils.existsParameters(param, condition) === false)
            {
                res.ext.badRequest(locale);
                break;
            }

            // プロバイダ名チェック
            const provider = <string>param.provider;
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
            const account = await AccountModel.find(session.account_id);

            if (account.canUnlink(provider))
            {
                account[provider] = null;
                await AccountModel.update(account);

                const data : Response.UnlinkProvider = {status:Response.Status.OK};
                res.json(data);
            }
            else
            {
                res.ext.error(Response.Status.FAILED, R.text(R.CANNOT_UNLINK, locale));
            }
        }
        while (false);
        log.stepOut();
    }
    catch (err) {Utils.internalServerError(err, res, log);}
}
