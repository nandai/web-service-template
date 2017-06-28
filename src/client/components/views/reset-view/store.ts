/**
 * (C) 2016-2017 printf.jp
 */
import {Response} from 'libs/response';

export interface Store
{
    locale                : string;
    password              : string;
    confirm               : string;
    resetPasswordResponse : Response.ResetPassword;
    message               : string;
    onPasswordChange?     : (value : string) => void;
    onConfirmChange?      : (value : string) => void;
    onChange?             : () => void;
}
