/**
 * (C) 2016-2017 printf.jp
 */
import {BaseStore, initBaseStore} from '../base-store';

export namespace storeNS
{
    export interface Store extends BaseStore
    {
        message?    : string;
        onSettings? : () => void;
        onInvite?   : () => void;
        onUsers?    : () => void;
        onLogout?   : () => void;
    }

    export function init(src : Store) : Store
    {
        const store : Store =
        {
            effect:     'fade',
            message:    src.message || '',
            onSettings: src.onSettings,
            onInvite:   src.onInvite,
            onUsers:    src.onUsers,
            onLogout:   src.onLogout,
        };
        initBaseStore(store, src);
        return store;
    }
}
