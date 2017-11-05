/**
 * (C) 2016-2017 printf.jp
 */
import {Response}    from 'libs/response';
import {slog}        from 'libs/slog';
import Utils         from 'server/libs/utils';
import {getUserList} from './getUserList';

import express = require('express');

/**
 * ユーザー一覧取得<br>
 * GET /api/users
 */
export async function onGetUserList(_req : express.Request, res : express.Response)
{
    const log = slog.stepIn('UserApi', 'onGetUserList');
    try
    {
        const data = await getUserList();
        res.json(data);
        log.stepOut();
    }
    catch (err) {Utils.internalServerError(err, res, log);}
}

/**
 * GraphQLバージョン
 */
export function onGetUserListForGraphQL()
{
    const log = slog.stepIn('UserApi', 'onGetUserListForGraphQL');
    return new Promise(async (resolve : (user : Response.User[]) => void, reject) =>
    {
        try
        {
            const data = await getUserList();
            log.stepOut();
            resolve(data.userList);
        }
        catch (err) {log.stepOut(); reject(err);}
    });
}
