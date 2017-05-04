/**
 * (C) 2016-2017 printf.jp
 */
import * as React            from 'react';
import * as ReactDOM         from 'react-dom/server';
import {view, notFound}      from './view';
import UserApi               from '../api/user-api';
import Root                  from 'client/components/root';
import UserView              from 'client/components/views/user-view/user-view';
import {Store as UserStore}  from 'client/components/views/user-view/store';
import UsersView             from 'client/components/views/users-view/users-view';
import {Store as UsersStore} from 'client/components/views/users-view/store';
import ClientR               from 'client/libs/r';

import express = require('express');
import slog =    require('../slog');

/**
 * ユーザー一覧コントローラ
 */
export default class UsersController
{
    private static CLS_NAME = 'UsersController';

    /**
     * GET /users/:id
     *
     * @param   req httpリクエスト
     * @param   res httpレスポンス
     */
    static async user(req : express.Request, res : express.Response)
    {
        const log = slog.stepIn(UsersController.CLS_NAME, 'user');
        const locale = req.ext.locale;
        const id = Number(req.params.id);

        const data = await UserApi.getUser(req, id);

        if (data.user)
        {
            const store : UserStore =
            {
                locale: locale,
                user:   data.user
            };

            const title = ClientR.text(ClientR.USER, locale);
            const el = <UserView store={store} />;
            const contents = ReactDOM.renderToString(<Root view={el} />);
            res.send(view(title, 'wst.js', contents, store));
        }
        else
        {
            notFound(req, res);
        }

        log.stepOut();
    }

    /**
     * GET /users
     *
     * @param   req httpリクエスト
     * @param   res httpレスポンス
     */
    static async users(req : express.Request, res : express.Response)
    {
        const log = slog.stepIn(UsersController.CLS_NAME, 'users');
        const locale = req.ext.locale;

        const data = await UserApi.getUserList();
        const store : UsersStore =
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
