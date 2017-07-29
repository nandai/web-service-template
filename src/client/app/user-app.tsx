/**
 * (C) 2016-2017 printf.jp
 */
import * as React        from 'react';

import UserApi           from 'client/api/user-api';
import {App}             from 'client/app/app';
import UserView          from 'client/components/views/user-view';
import {storeNS}         from 'client/components/views/user-view/store';
import History           from 'client/libs/history';
import {SocketEventData} from 'client/libs/socket-event-data';
import Utils             from 'client/libs/utils';
import {Response}        from 'libs/response';

/**
 * users app
 */
export default class UserApp extends App
{
    store : storeNS.Store;

    /**
     * @constructor
     */
    constructor(ssrStore? : storeNS.Store)
    {
        super();

        if (! ssrStore) {
            ssrStore = Utils.getSsrStore<storeNS.Store>();
        }

        this.store = storeNS.init(ssrStore);
        this.store.onBack = this.onBack;
    }

    /**
     * toString
     */
    toString() : string
    {
        return 'UserApp';
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
                if (store.online)
                {
                    const res : Response.GetUser = await UserApi.getUser({id:params.id});

                    if (res.status !== Response.Status.OK || res.user === null)
                    {
                        reject(new Error('user not found.'));
                    }
                    else
                    {
                        store.user = res.user;
                        resolve();
                    }
                }
                else
                {
                    // TODO:offlineをrejectにするのは変だから別の仕組みが必要
                    reject(new Error('user not found.'));
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
