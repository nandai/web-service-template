/**
 * (C) 2016-2017 printf.jp
 */
import {BaseStore, initBaseStore} from '../base-store';

export namespace storeNS
{
    export interface Store extends BaseStore
    {
    }

    export function init(src : Store) : BaseStore
    {
        const store : Store =
        {
            page: {effect:'slide'}
        };
        initBaseStore(store, src);
        return store;
    }
}
