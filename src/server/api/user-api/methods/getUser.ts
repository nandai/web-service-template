/**
 * (C) 2016-2017 printf.jp
 */
import {Request}               from 'libs/request';
import {Response}              from 'libs/response';
import R                       from 'server/libs/r';
import AccountModel, {Account} from 'server/models/account-model';

import express = require('express');
import slog =    require('server/slog');

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
            const data  : Response.GetUser = {};
            let account : Account = null;
            const id = <string>param.id;

            if (id)
            {
                if (isNaN(Number(id))) {
                    account = await AccountModel.findByUserName(id);
                } else {
                    account = await AccountModel.find(Number(id));
                }
            }

            if (account === null)
            {
                data.status =  Response.Status.FAILED;
                data.message = R.text(R.NOT_FOUND, locale);
            }
            else
            {
                data.status = Response.Status.OK;
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
