/**
 * (C) 2016-2017 printf.jp
 */
import {Response}         from 'libs/response';
import {slog}             from 'libs/slog';
import AccountAgent       from 'server/agents/account-agent';
import DeleteAccountAgent from 'server/agents/delete-account-agent';
import SessionAgent       from 'server/agents/session-agent';
import Utils              from 'server/libs/utils';
import {Session}          from 'server/models/session';

import express = require('express');

/**
 * アカウント削除<br>
 * DELETE /api/settings/account
 */
export async function onDeleteAccount(req : express.Request, res : express.Response)
{
    const log = slog.stepIn('SettingsApi', 'onDeleteAccount');
    try
    {
        const session : Session = req.ext.session;
        const accountId = session.account_id;

        const account = await AccountAgent.find(accountId);
        AccountAgent.encrypt(account);

        await DeleteAccountAgent.add(account);
        await AccountAgent.remove( accountId);
        await SessionAgent.logout({accountId});

//      req.logout();

        const data : Response.DeleteAccount = {status:Response.Status.OK};
        res.json(data);
        log.stepOut();
    }
    catch (err) {Utils.internalServerError(err, res, log);}
}
