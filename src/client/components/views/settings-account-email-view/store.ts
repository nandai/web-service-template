/**
 * (C) 2016-2017 printf.jp
 */
import {Response}                 from 'libs/response';
import {BaseStore, initBaseStore} from '../base-store';

export namespace storeNS
{
    export interface Store extends BaseStore
    {
        message?                    : string;
        loading?                    : boolean;
        onEmailChange?              : (value : string) => void;
        onChange?                   : () => void;
        onBack?                     : () => void;
        requestChangeEmailResponse? : Response.RequestChangeEmail;
    }

    export function init(src : Store) : Store
    {
        const store : Store =
        {
            message:       '',
            loading:       false,
            onEmailChange: src.onEmailChange,
            onChange:      src.onChange,
            onBack:        src.onBack,
            requestChangeEmailResponse: {status:Response.Status.OK, message:{}},
        };
        initBaseStore(store, src);
        return store;
    }
}
