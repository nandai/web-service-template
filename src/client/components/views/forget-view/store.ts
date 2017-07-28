/**
 * (C) 2016-2017 printf.jp
 */
import {Response}  from 'libs/response';
import {BaseStore} from '../base-store';

export namespace storeNS
{
    export interface Store extends BaseStore
    {
        email?                      : string;
        message?                    : string;
        loading?                    : boolean;
        onEmailChange?              : (value : string) => void;
        onSend?                     : () => void;
        onBack?                     : () => void;
        requestResetPasswordResult? : Response.RequestResetPassword;
    }

    export function init(src : Store) : Store
    {
        const store : Store =
        {
            locale:        src.locale,
            account:       null,
            email:         '',
            message:       '',
            loading:       false,
            onEmailChange: src.onEmailChange,
            onSend:        src.onSend,
            onBack:        src.onBack,
            requestResetPasswordResult: {status:Response.Status.OK, message:{}}
        };
        return store;
    }
}
