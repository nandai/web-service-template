/**
 * (C) 2016-2017 printf.jp
 */
import Utils                   from '../libs/utils';
import AccountModel, {Account} from '../models/account-model';
import {Response}               from 'libs/response';

import express = require('express');
import slog =    require('../slog');

/**
 * ユーザーAPI
 */
export default class UserApi
{
    private static CLS_NAME = 'UserApi';

    /**
     * ユーザー一覧取得<br>
     * GET /api/users
     */
    static async onGetUserList(req : express.Request, res : express.Response)
    {
        const log = slog.stepIn(UserApi.CLS_NAME, 'onGetUserList');
        try
        {
            const accountList = await AccountModel.findList();
            const userList = accountList.map(account =>
            {
                const user : Response.User = {name:account.name};
                return user;
            });

            const data : Response.GetUserList =
            {
                status:   0,
                userList: userList
            }

            res.json(data);
            log.stepOut();
        }
        catch (err) {Utils.internalServerError(err, res, log)};
    }
}
