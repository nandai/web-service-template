/**
 * (C) 2016-2017 printf.jp
 */
import {Response}                 from 'libs/response';
import {BaseStore, initBaseStore} from '../base-store';

export namespace storeNS
{
    export interface Store extends BaseStore
    {
        userList? : Response.User[];
        onUser?   : (id : string) => void;
        onBack?   : () => void;
    }

    export function init(src : Store) : Store
    {
        const store : Store =
        {
            userList: src.userList || [],
            onUser:   src.onUser,
            onBack:   src.onBack
        };
        initBaseStore(store, src);
        return store;
    }
}
