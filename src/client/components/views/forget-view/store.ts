/**
 * (C) 2016-2017 printf.jp
 */
import {Response} from 'libs/response';

export interface Store
{
    locale                     : string;
    email?                     : string;
    requestResetPasswordResult : Response.RequestResetPassword;
    message?                   : string;
    onEmailChange?             : (value : string) => void;
    onSend?                    : () => void;
    onBack?                    : () => void;
}
