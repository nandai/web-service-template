/**
 * (C) 2016-2017 printf.jp
 */
import * as React        from 'react';

import UserApi           from 'client/api/user-api';
import {App}             from 'client/app/app';
import UserView          from 'client/components/views/user-view';
import {Store}           from 'client/components/views/user-view/store';
import History           from 'client/libs/history';
import {SocketEventData} from 'client/libs/socket-event-data';
import Utils             from 'client/libs/utils';
import {Response}        from 'libs/response';

const ssrStore = Utils.getSsrStore<Store>();

/**
 * users app
 */
export default class UserApp extends App
{
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
    init(params, _message? : string)
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

    /**
     * ソケットイベント通知
     */
    notifySocketEvent(data : SocketEventData) : void
    {
        const {store} = this;
        do
        {
            if (! store.user) {
                break;
            }

            if (data.notifyUpdateUser)
            {
                const user = data.notifyUpdateUser;
                if (store.user.id !== user.id) {
                    break;
                }

                if (this.active && store.user.name !== user.name)
                {
                    const id = (user.name ? user.name : user.id.toString());
                    History.replaceState(`/users/${id}`);
                }
                store.user = user;
            }

            if (data.notifyDeleteUser)
            {
                const user = data.notifyDeleteUser;
                if (store.user.id === user.id) {
                    store.user.id = 0;
                }
            }
        }
        while (false);
    }
}
