/**
 * (C) 2016-2017 printf.jp
 */
import {Request}    from 'libs/request';
import {Response}   from 'libs/response';
import AccountAgent from 'server/agents/account-agent';
import R            from 'server/libs/r';
import {slog}       from 'server/libs/slog';
import {Account}    from 'server/models/account';

import express = require('express');

/**
 * ユーザー取得
 */
export function getUser(param : Request.GetUser, req : express.Request)
{
    return new Promise(async (resolve : (data : Response.GetUser) => void, reject) =>
    {
        const log = slog.stepIn('UserApi', 'getUser');
        try
        {
            const locale = req.ext.locale;
            const data  : Response.GetUser = {status:Response.Status.OK, user:null};
            let account : Account = null;
            const id = <string>param.id;

            if (id)
            {
                if (isNaN(Number(id))) {
                    account = await AccountAgent.findByUserName(id);
                } else {
                    account = await AccountAgent.find(Number(id));
                }
            }

            if (account)
            {
                data.user =
                {
                    id:          account.id,
                    accountName: account.name,
                    name:        account.user_name
                };
            }

            log.stepOut();
            resolve(data);
        }
        catch (err) {log.stepOut(); reject(err);}
    });
}
