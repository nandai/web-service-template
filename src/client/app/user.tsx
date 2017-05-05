/**
 * (C) 2016-2017 printf.jp
 */
import * as React from 'react';
import {App}      from './app';
import UserApi    from '../api/user-api';
import UserView   from '../components/views/user-view/user-view';
import {Store}    from '../components/views/user-view/store';
import Utils      from '../libs/utils';

const slog = window['slog'];
const ssrStore = Utils.getSsrStore<Store>();

/**
 * users app
 */
export default class UserApp extends App
{
    private static CLS_NAME = 'UserApp';
    private store : Store;

    /**
     * @constructor
     */
    constructor()
    {
        super();
        this.store =
        {
            locale: Utils.getLocale(),
            user:   ssrStore.user,
            onBack: this.onBack.bind(this)
        };
    }

    /**
     * 初期化
     */
    init(params)
    {
        return new Promise(async (resolve : () => void, reject) =>
        {
            try
            {
                const {store} = this;
                const res = await UserApi.getUser({id:params.id});
                store.user = res.user;
                resolve();
            }
            catch (err) {reject(err)}
        });
    }

    /**
     * view
     */
    view() : JSX.Element
    {
        return <UserView store={this.store} />;
    }
}
