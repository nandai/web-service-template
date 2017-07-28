/**
 * (C) 2016-2017 printf.jp
 */
import * as React       from 'react';
import * as ReactDOM    from 'react-dom/server';

import Root             from 'client/components/root';
import UserView         from 'client/components/views/user-view';
import {storeNS}        from 'client/components/views/user-view/store';
import ClientR          from 'client/libs/r';
import {slog}           from 'libs/slog';
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
            const store = storeNS.init({locale, user});
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
}
