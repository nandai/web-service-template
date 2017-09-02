/**
 * (C) 2016-2017 printf.jp
 */
import ClientApp        from 'client/app/user-app';
import {slog}           from 'libs/slog';
import SettingsApi      from 'server/api/settings-api';
import UserApi          from 'server/api/user-api';
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
        const locale = req.ext.locale;
        const id : string = req.params.id;

        const data = await UserApi.getUser({id}, req);
        const {user} = data;

        if (user)
        {
            const data1 = await SettingsApi.getAccount(req);
            const {account} =  data1;
            const app = new ClientApp({locale, account, user});
            res.send(view(app));
        }
        else
        {
            await notFound(req, res);
        }

        log.stepOut();
    }
}
