/**
 * (C) 2016-2017 printf.jp
 */
import {Response}                 from 'libs/response';
import {BaseStore, initBaseStore} from '../base-store';

export namespace storeNS
{
    export interface Store extends BaseStore
    {
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
            page:                   {effect:'fade'},
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
        initBaseStore(store, src);
        return store;
    }
}
