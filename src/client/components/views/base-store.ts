/**
 * (C) 2016-2017 printf.jp
 */
import {pageNS}   from 'client/libs/page';
import {Response} from 'libs/response';

export interface BaseStore
{
    locale?      : string;
    url?         : string;
    account?     : Response.Account;
    prevAccount? : Response.Account;    // accountの１つ前の状態
    online?      : boolean;
    page?        : pageNS.Page;
}

export function initBaseStore(dest : BaseStore, src : BaseStore) : void
{
    dest.locale =   src.locale;
    dest.url =      src.url;
    dest.account =  src.account || null;
    dest.online =  (src.online !== undefined ? src.online : true);
    dest.page = pageNS.factory(src.page, dest.page.effect);
}
