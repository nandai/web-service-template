/**
 * (C) 2016-2017 printf.jp
 */
import {slog}        from 'server/libs/slog';
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
