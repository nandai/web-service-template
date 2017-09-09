/**
 * (C) 2016-2017 printf.jp
 */
import {storeNS}        from 'client/components/views/user-view/store';
import {slog}           from 'libs/slog';
import SettingsApi      from 'server/api/settings-api';
import UserApi          from 'server/api/user-api';
import Utils            from 'server/libs/utils';
import {notFound, view} from './view';

import express = require('express');

/**
 * users app
 */
export default class UserApp
{
    private static CLS_NAME = 'UserApp';

    /**
     * GET /users/:id
     *
     * @param   req httpリクエスト
     * @param   res httpレスポンス
     */
    static async index(req : express.Request, res : express.Response)
    {
        const log = slog.stepIn(UserApp.CLS_NAME, 'index');
        const id : string = req.params.id;

        try
        {
            const data = await UserApi.getUser({id}, req);
            const {user} = data;

            if (user)
            {
                const data1 = await SettingsApi.getAccount(req);
                const {account} =  data1;
                const store : storeNS.Store = {account, user};
                res.send(view(req, store));
            }
            else
            {
                await notFound(req, res);
            }

            log.stepOut();
        }
        catch (err) {Utils.internalServerError(err, res, log);}
    }
}
