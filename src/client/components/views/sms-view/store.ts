/**
 * (C) 2016-2017 printf.jp
 */
import {Response} from 'libs/response';

export interface Store
{
    locale           : string;
    smsCode          : string;
    loginSmsResponse : Response.LoginSms;
    message?         : string;
    onSmsCodeChange? : (value : string) => void;
    onSend?          : () => void;
}
