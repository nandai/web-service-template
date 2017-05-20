/**
 * (C) 2016-2017 printf.jp
 */
import {Response} from 'libs/response';

export interface Store
{
    locale      : string;
    account     : Response.Account;
    message     : string;
    onSettings? : () => void;
    onInvite?   : () => void;
    onUsers?    : () => void;
    onLogout?   : () => void;
}
