/**
 * (C) 2016-2017 printf.jp
 */
import bind       from 'bind-decorator';
import * as React from 'react';

import {Response} from 'libs/response';
import UserApi    from '../api/user-api';
import UsersView  from '../components/views/users-view';
import {Store}    from '../components/views/users-view/store';
import History    from '../libs/history';
import Utils      from '../libs/utils';
import {App}      from './app';

const slog = window['slog'];
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
            locale:      Utils.getLocale(),
            userList:    ssrStore.userList || [],
            onUserClick: this.onUserClick,
            onBack:      this.onBack,
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
    private onUserClick(id : number) : void
    {
        const log = slog.stepIn(UsersApp.CLS_NAME, 'onUserClick');
        History.pushState(`/users/${id}`);
        log.stepOut();
    }
}
