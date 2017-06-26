/**
 * (C) 2016-2017 printf.jp
 */
import {Response} from 'libs/response';

export interface Store
{
    locale                 : string;
    account                : Response.Account;
    oldPassword            : string;
    newPassword            : string;
    confirm                : string;
    changePasswordResponse : Response.ChangePassword;
    message?               : string;
    onOldPasswordChange?   : (value : string) => void;
    onNewPasswordChange?   : (value : string) => void;
    onConfirmChange?       : (value : string) => void;
    onChange?              : () => void;
    onBack?                : () => void;
}
