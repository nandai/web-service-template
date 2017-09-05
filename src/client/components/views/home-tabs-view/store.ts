/**
 * (C) 2016-2017 printf.jp
 */
import {BaseStore, initBaseStore} from '../base-store';

export namespace storeNS
{
    export interface Store extends BaseStore
    {
        onLogin?     : () => void;
        onSignup?    : () => void;
        onAbout?     : () => void;
    }

    export function init(src : Store) : Store
    {
        const store : Store =
        {
            page:     {effect:'fade'},
            onLogin:  src.onLogin,
            onSignup: src.onSignup,
            onAbout:  src.onAbout
        };
        initBaseStore(store, src);

        return store;
    }
}
