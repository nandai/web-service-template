/**
 * (C) 2016-2017 printf.jp
 */
import {Response}  from 'libs/response';
import {BaseStore} from '../base-store';

export namespace storeNS
{
    export interface Store extends BaseStore
    {
        password?              : string;
        confirm?               : string;
        message?               : string;
        onPasswordChange?      : (value : string) => void;
        onConfirmChange?       : (value : string) => void;
        onChange?              : () => void;
        resetPasswordResponse? : Response.ResetPassword;
    }

    export function init(src : Store) : Store
    {
        const store : Store =
        {
            locale:                src.locale,
            account:               null,
            password:              '',
            confirm:               '',
            message:               '',
            onPasswordChange:      src.onPasswordChange,
            onConfirmChange:       src.onConfirmChange,
            onChange:              src.onChange,
            resetPasswordResponse: {status:Response.Status.OK, message:{}}
        };
        return store;
    }
}
