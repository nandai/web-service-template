/**
 * (C) 2016-2017 printf.jp
 */
import {Response}                 from 'libs/response';
import {BaseStore, initBaseStore} from '../base-store';

export namespace storeNS
{
    export interface Store extends BaseStore
    {
        user?    : Response.User;
        onBack?  : () => void;
    }

    export function init(src : Store) : Store
    {
        const store : Store =
        {
            locale:  src.locale,
            account: src.account  || null,
            user:    src.user,
            onBack:  src.onBack,
        };
        initBaseStore(store, src);
        return store;
    }
}
