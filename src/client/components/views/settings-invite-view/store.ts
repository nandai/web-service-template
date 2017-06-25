/**
 * (C) 2016-2017 printf.jp
 */
import {Response} from 'libs/response';

export interface Store
{
    locale         : string;
    account        : Response.Account;
    email          : string;
    inviteResponse : Response.Invite;
    message?       : string;
    onEmailChange? : (value : string) => void;
    onInvite?      : () => void;
    onBack?        : () => void;
}
