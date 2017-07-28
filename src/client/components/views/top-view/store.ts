/**
 * (C) 2016-2017 printf.jp
 */
import {Response}  from 'libs/response';
import {BaseStore} from '../base-store';

export namespace storeNS
{
    export interface Store extends BaseStore
    {
        account?    : Response.Account;
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
            locale:     src.locale,
            account:    src.account || null,
            message:    src.message || '',
            onSettings: src.onSettings,
            onInvite:   src.onInvite,
            onUsers:    src.onUsers,
            onLogout:   src.onLogout,
        };
        return store;
    }
}
