/**
 * (C) 2016-2017 printf.jp
 */
import {Response}              from 'libs/response';
import Utils                   from 'server/libs/utils';
import AccountModel            from 'server/models/account-model';
import DeleteAccountModel      from 'server/models/delete-account-model';
import SessionModel, {Session} from 'server/models/session-model';

import express = require('express');
import slog =    require('server/slog');

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
        const account = await AccountModel.find(accountId);

        await DeleteAccountModel.add(account);
        await AccountModel.remove( accountId);
        await SessionModel.logout({accountId});

//      req.logout();

        const data : Response.DeleteAccount = {status:0};
        res.json(data);
        log.stepOut();
    }
    catch (err) {Utils.internalServerError(err, res, log);}
}
