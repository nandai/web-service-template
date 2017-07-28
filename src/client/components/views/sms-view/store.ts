/**
 * (C) 2016-2017 printf.jp
 */
import {Response}  from 'libs/response';
import {BaseStore} from '../base-store';

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
            locale:           src.locale,
            account:          null,
            smsCode:          '',
            message:          '',
            onSmsCodeChange:  src.onSmsCodeChange,
            loginSmsResponse: {status:Response.Status.OK, message:{}}
        };
        return store;
    }
}
