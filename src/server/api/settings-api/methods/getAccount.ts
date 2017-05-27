/**
 * (C) 2016-2017 printf.jp
 */
import {Response}   from 'libs/response';
import AccountModel from 'server/models/account-model';
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
            const account = await AccountModel.find(session.account_id);
            const accountRes : Response.Account =
            {
                name:          account.name,
                email:         account.email,
                countryCode:   account.country_code,
                phoneNo:       account.phone_no,
                twoFactorAuth: account.two_factor_auth,
                twitter:      (account.twitter  !== null),
                facebook:     (account.facebook !== null),
                google:       (account.google   !== null),
                github:       (account.github   !== null)
            };

            const data : Response.GetAccount =
            {
                status:  0,
                account: accountRes
            };

            log.stepOut();
            resolve(data);
        }
        catch (err) {log.stepOut(); reject(err);}
    });
}
