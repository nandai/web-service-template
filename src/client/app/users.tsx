/**
 * (C) 2016-2017 printf.jp
 */
import * as React from 'react';
import {App}      from './app';
import UserApi    from '../api/user-api';
import UsersView  from '../components/views/users-view/users-view';
import {Store}    from '../components/views/users-view/store';
import Utils      from '../libs/utils';

const slog = window['slog'];
const ssrStore : Store = window['ssrStore'];

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
            userList: ssrStore.userList,
            onBack:   this.onBack.bind(this)
        };
    }

    /**
     * 初期化
     */
    init() : void
    {
        const {store} = this;
        // TODO:initをasyncにしてから対応する
        // store.userList = await UserApi.getUserList();
    }

    /**
     * view
     */
    view() : JSX.Element
    {
        return <UsersView store={this.store} />;
    }
}
