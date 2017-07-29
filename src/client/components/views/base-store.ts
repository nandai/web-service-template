/**
 * (C) 2016-2017 printf.jp
 */
import {Response} from 'libs/response';

export interface BaseStore
{
    locale?  : string;
    account? : Response.Account;
    online?  : boolean;
}

export function initBaseStore(dest : BaseStore, src : BaseStore) : void
{
    dest.locale =  src.locale;
    dest.account = src.account || null;
    dest.online = (src.online !== undefined ? src.online : true);
}
