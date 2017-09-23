/**
 * (C) 2016-2017 printf.jp
 */
import {BaseStore, initBaseStore} from '../base-store';

export namespace storeNS
{
    export interface Store extends BaseStore
    {
    }

    export function init(src : Store) : Store
    {
        const store : Store =
        {
            page: {effect:'fade'},
        };
        initBaseStore(store, src);
        return store;
    }
}
