/**
 * (C) 2016-2017 printf.jp
 */
import {Response} from 'libs/response';

export interface Store
{
    locale                     : string;
    account                    : Response.Account;
    requestChangeEmailResponse : Response.RequestChangeEmail;
    loading?                   : boolean;
    message?                   : string;
    onEmailChange?             : (value : string) => void;
    onChange?                  : () => void;
    onBack?                    : () => void;
}
