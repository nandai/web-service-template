/**
 * (C) 2016-2017 printf.jp
 */
import {Response} from 'libs/response';

export interface Store
{
    locale      : string;
    account     : Response.Account;
    message?    : string;
    onTwitter?  : () => void;
    onFacebook? : () => void;
    onGoogle?   : () => void;
    onEmail?    : () => void;
    onPassword? : () => void;
    onAccount?  : () => void;
    onLeave?    : () => void;
    onBack?     : () => void;
}
