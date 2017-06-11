/**
 * (C) 2016-2017 printf.jp
 */
import {Response}   from 'libs/response';
import AccountAgent from 'server/agents/account-agent';
import Converter    from 'server/libs/converter';
import {Session}    from 'server/models/session-model';

import express = require('express');
import slog =    require('server/slog');

/**
 * アカウント取得
 */
export function getAccount(req : express.Request)
{
    return new Promise(async (resolve : (data : Response.GetAccount) => void, reject) =>
    {
        const log = slog.stepIn('SettingsApi', 'getAccount');
        try
        {
            const session : Session = req.ext.session;
            const account = await AccountAgent.find(session.account_id);

            const data : Response.GetAccount =
            {
                status:  Response.Status.OK,
                account: Converter.accountToResponse(account)
            };

            log.stepOut();
            resolve(data);
        }
        catch (err) {log.stepOut(); reject(err);}
    });
}
