/**
 * (C) 2016-2017 printf.jp
 */
import * as React from 'react';

import {Response} from 'libs/response';
import UserApi    from '../api/user-api';
import UserView   from '../components/views/user-view';
import {Store}    from '../components/views/user-view/store';
import Utils      from '../libs/utils';
import {App}      from './app';

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
            onBack: this.onBack,
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
                const res : Response.GetUser = await UserApi.getUser({id:params.id});

                if (res.status !== Response.Status.OK)
                {
                    reject(new Error('user not found.'));
                }
                else
                {
                    store.user = res.user;
                    resolve();
                }
            }
            catch (err) {reject(err);}
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
