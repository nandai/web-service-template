/**
 * (C) 2016-2017 printf.jp
 */
import * as React    from 'react';
import * as ReactDOM from 'react-dom/server';

import ClientApp     from 'client/app/users-app';
import Root          from 'client/components/root';
import ClientR       from 'client/libs/r';
import {slog}        from 'libs/slog';
import SettingsApi   from 'server/api/settings-api';
import UserApi       from 'server/api/user-api';
import {view}        from './view';

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
        const locale = req.ext.locale;

        const data1 = await SettingsApi.getAccount(req);
        const data2 = await UserApi.getUserList();
        const {account} =  data1;
        const {userList} = data2;
        const title = ClientR.text(ClientR.USER_LIST, locale);
        const app = new ClientApp({locale, account, userList});
        const contents = ReactDOM.renderToString(<Root app={app} />);
        res.send(view(title, 'wst.js', contents, app.store));
        log.stepOut();
    }
}
