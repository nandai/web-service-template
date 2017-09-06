/**
 * (C) 2016-2017 printf.jp
 */
import bind              from 'bind-decorator';
import * as React        from 'react';

import UserApi           from 'client/api/user-api';
import {App}             from 'client/app/app';
import UsersView         from 'client/components/views/users-view';
import {storeNS}         from 'client/components/views/users-view/store';
import History           from 'client/libs/history';
import R                 from 'client/libs/r';
import {SocketEventData} from 'client/libs/socket-event-data';
import {Response}        from 'libs/response';
import {slog}            from 'libs/slog';

/**
 * users app
 */
export default class UsersApp extends App
{
    private static CLS_NAME = 'UsersApp';
    store : storeNS.Store;

    /**
     * @constructor
     */
    constructor(ssrStore : storeNS.Store)
    {
        super();

        this.store = storeNS.init(ssrStore);
        this.url = '/users';
        this.title = R.text(R.USER_LIST, this.store.locale);

        this.store.onUser = this.onUser;
        this.store.onBack = this.onBack;
    }

    /**
     * toString
     */
    toString() : string
    {
        return 'UsersApp';
    }

    /**
     * 初期化
     */
    init(_params, _message? : string)
    {
        return new Promise(async (resolve : () => void, reject) =>
        {
            try
            {
                const {store} = this;
                if (store.online)
                {
                    const res : Response.GetUserList = await UserApi.getUserList();
                    store.userList = res.userList;
                }
                resolve();
            }
            catch (err) {reject(err);}
        });
    }

    /**
     * view
     */
    view(i : number) : JSX.Element
    {
        return <UsersView key={i} store={this.store} />;
    }

    /**
     * ソケットイベント通知
     */
    notifySocketEvent(data : SocketEventData) : void
    {
        if (data.notifyUpdateUser)
        {
            const user = data.notifyUpdateUser;
            const {userList} = this.store;
            let replace = false;

            for (const i in userList)
            {
                if (userList[i].id === user.id)
                {
                    userList[i] = user;
                    replace = true;
                    break;
                }
            }

            if (replace === false) {
                userList.push(user);
            }
        }

        if (data.notifyDeleteUser)
        {
            const user = data.notifyDeleteUser;
            const {userList} = this.store;

            for (const i in userList)
            {
                if (userList[i].id === user.id)
                {
                    userList.splice(Number(i), 1);
                    break;
                }
            }
        }
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
