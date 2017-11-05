/**
 * (C) 2016-2017 printf.jp
 */
import {storeNS}   from 'client/components/views/users-view/store';
import {slog}      from 'libs/slog';
import SettingsApi from 'server/api/settings-api';
import UserApi     from 'server/api/user-api';
import Utils       from 'server/libs/utils';
import {view}      from './view';

import express = require('express');

/**
 * users app
 */
export default class UsersApp
{
    private static CLS_NAME = 'UsersApp';

    /**
     * GET /users
     *
     * @param   req httpリクエスト
     * @param   res httpレスポンス
     */
    static async index(req : express.Request, res : express.Response)
    {
        const log = slog.stepIn(UsersApp.CLS_NAME, 'index');
        try
        {
            const data1 = await SettingsApi.getAccount(req);
//          const data2 = await UserApi.getUserList();
            const data2 = await UserApi.getUserListForGraphQL();
            const {account} =  data1;
            const {userList} = data2;
            const store : storeNS.Store = {account, userList};

            res.send(view(req, store));
            log.stepOut();
        }
        catch (err) {Utils.internalServerError(err, res, log);}
    }
}
