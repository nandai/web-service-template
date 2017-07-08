/**
 * (C) 2016-2017 printf.jp
 */
import bind       from 'bind-decorator';
import * as React from 'react';

import UserApi    from 'client/api/user-api';
import {App}      from 'client/app/app';
import UsersView  from 'client/components/views/users-view';
import {Store}    from 'client/components/views/users-view/store';
import History    from 'client/libs/history';
import {slog}     from 'client/libs/slog';
import Utils      from 'client/libs/utils';
import {Response} from 'libs/response';

const ssrStore = Utils.getSsrStore<Store>();

/**
 * users app
 */
export default class UsersApp extends App
{
    private static CLS_NAME = 'UsersApp';
    private store : Store;

    /**
     * @constructor
     */
    constructor()
    {
        super();
        this.store =
        {
            locale:   Utils.getLocale(),
            userList: ssrStore.userList || [],
            onUser:   this.onUser,
            onBack:   this.onBack,
        };
    }

    /**
     * 初期化
     */
    init(params, message? : string)
    {
        return new Promise(async (resolve : () => void, reject) =>
        {
            try
            {
                const {store} = this;
                const res : Response.GetUserList = await UserApi.getUserList();
                store.userList = res.userList;
                resolve();
            }
            catch (err) {reject(err);}
        });
    }

    /**
     * view
     */
    view() : JSX.Element
    {
        return <UsersView store={this.store} />;
    }

    /**
     * user click event
     */
    @bind
    private onUser(id : string) : void
    {
        const log = slog.stepIn(UsersApp.CLS_NAME, 'onUser');
        History.pushState(`/users/${id}`);
        log.stepOut();
    }
}
