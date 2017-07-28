/**
 * (C) 2016-2017 printf.jp
 */
import {Response}  from 'libs/response';
import {BaseStore} from '../base-store';

export namespace storeNS
{
    export interface Store extends BaseStore
    {
        account?                : Response.Account;
        oldPassword?            : string;
        newPassword?            : string;
        confirm?                : string;
        message?                : string;
        onOldPasswordChange?    : (value : string) => void;
        onNewPasswordChange?    : (value : string) => void;
        onConfirmChange?        : (value : string) => void;
        onChange?               : () => void;
        onBack?                 : () => void;
        changePasswordResponse? : Response.ChangePassword;
    }

    export function init(src : Store) : Store
    {
        const store : Store =
        {
            locale:                 src.locale,
            account:                src.account || null,
            oldPassword:            '',
            newPassword:            '',
            confirm:                '',
            message:                '',
            onOldPasswordChange:    src.onOldPasswordChange,
            onNewPasswordChange:    src.onNewPasswordChange,
            onConfirmChange:        src.onConfirmChange,
            onChange:               src.onChange,
            onBack:                 src.onBack,
            changePasswordResponse: {status:Response.Status.OK, message:{}}
        };
        return store;
    }
}
