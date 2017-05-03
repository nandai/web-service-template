/**
 * (C) 2016-2017 printf.jp
 */
import * as React    from 'react';
import * as ReactDOM from 'react-dom/server';
import {view}        from './view';
import UserApi       from '../api/user-api';
import Root          from 'client/components/root';
import UsersView     from 'client/components/views/users-view/users-view';
import {Store}       from 'client/components/views/users-view/store';
import ClientR       from 'client/libs/r';

import express = require('express');
import slog =    require('../slog');

/**
 * ユーザー一覧コントローラ
 */
export default class UsersController
{
    private static CLS_NAME = 'UsersController';

    /**
     * GET /users
     *
     * @param   req httpリクエスト
     * @param   res httpレスポンス
     */
    static async index(req : express.Request, res : express.Response)
    {
        const log = slog.stepIn(UsersController.CLS_NAME, 'index');
        const locale = req.ext.locale;

        const data = await UserApi.getUserList();
        const store : Store =
        {
            locale:   locale,
            userList: data.userList
        };

        const title = ClientR.text(ClientR.USER_LIST, locale);
        const el = <UsersView store={store}/>;
        const contents = ReactDOM.renderToString(<Root view={el} />);
        res.send(view(title, 'wst.js', contents, store));
        log.stepOut();
    }
}
