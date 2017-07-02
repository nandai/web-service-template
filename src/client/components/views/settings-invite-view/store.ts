/**
 * (C) 2016-2017 printf.jp
 */
import {Response} from 'libs/response';

export interface Store
{
    locale         : string;
    account        : Response.Account;
    email          : string;
    message?       : string;
    inviteResponse : Response.Invite;
    loading?       : boolean;
    onEmailChange? : (value : string) => void;
    onInvite?      : () => void;
    onBack?        : () => void;
}
