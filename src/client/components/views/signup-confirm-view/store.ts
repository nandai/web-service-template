/**
 * (C) 2016-2017 printf.jp
 */
import {Response} from 'libs/response';

export interface Store
{
    locale                     : string;
    password                   : string;
    confirmSignupEmailResponse : Response.ConfirmSignupEmail;
    message                    : string;
    onPasswordChange?          : (value : string) => void;
    onConfirm?                 : () => void;
}
