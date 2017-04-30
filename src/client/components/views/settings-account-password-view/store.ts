/**
 * (C) 2016-2017 printf.jp
 */
import {Response} from 'libs/response';

export interface Store
{
    locale               : string;
    account              : Response.Account;
    oldPassword?         : string;
    newPassword?         : string;
    confirm?             : string;
    message?             : string;
    onOldPasswordChange? : (e : React.ChangeEvent<HTMLInputElement>) => void;
    onNewPasswordChange? : (e : React.ChangeEvent<HTMLInputElement>) => void;
    onConfirmChange?     : (e : React.ChangeEvent<HTMLInputElement>) => void;
    onChange?            : () => void;
    onBack?              : () => void;
}
