/**
 * (C) 2016-2017 printf.jp
 */
import {Response}                 from 'libs/response';
import {BaseStore, initBaseStore} from '../base-store';

export namespace storeNS
{
    export interface Store extends BaseStore
    {
        password?         : string;
        message?          : string;
        onPasswordChange? : (value : string) => void;
        onJoin?           : () => void;
        joinResponse?     : Response.Join;
    }

    export function init(src : Store) : Store
    {
        const store : Store =
        {
            page:             {effect:'fade'},
            password:         '',
            message:          '',
            onPasswordChange: src.onPasswordChange,
            onJoin:           src.onJoin,
            joinResponse:     {status:Response.Status.OK, message:{}}
        };
        initBaseStore(store, src);
        return store;
    }
}
