/**
 * (C) 2016-2017 printf.jp
 */
import {Request}    from 'libs/request';
import {Response}   from 'libs/response';
import R            from 'server/libs/r';
import AccountModel from 'server/models/account-model';

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
            const data : Response.GetUser = {};
            const id = <number>param.id;
            const account = await AccountModel.find(id);

            if (account === null)
            {
                data.status =  Response.Status.FAILED;
                data.message = R.text(R.NOT_FOUND, locale);
            }
            else
            {
                data.status = Response.Status.OK;
                data.user = {id:account.id, name:account.name};
            }

            log.stepOut();
            resolve(data);
        }
        catch (err) {log.stepOut(); reject(err);}
    });
}
