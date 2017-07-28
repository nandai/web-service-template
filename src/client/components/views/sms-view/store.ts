/**
 * (C) 2016-2017 printf.jp
 */
import {Response}                 from 'libs/response';
import {BaseStore, initBaseStore} from '../base-store';

export namespace storeNS
{
    export interface Store extends BaseStore
    {
        smsCode?          : string;
        message?          : string;
        onSmsCodeChange?  : (value : string) => void;
        onSend?           : () => void;
        loginSmsResponse? : Response.LoginSms;
    }

    export function init(src : Store) : Store
    {
        const store : Store =
        {
            smsCode:          '',
            message:          '',
            onSmsCodeChange:  src.onSmsCodeChange,
            onSend:           src.onSend,
            loginSmsResponse: {status:Response.Status.OK, message:{}}
        };
        initBaseStore(store, src);
        return store;
    }
}
