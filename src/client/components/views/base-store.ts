/**
 * (C) 2016-2017 printf.jp
 */
import {pageNS}   from 'client/libs/page';
import {Response} from 'libs/response';

export interface BaseStore
{
    locale?  : string;
    account? : Response.Account;
    online?  : boolean;
    page?    : pageNS.Page;
}

export function initBaseStore(dest : BaseStore, src : BaseStore) : void
{
    const srcPage = src.page || {};

    dest.locale =   src.locale;
    dest.account =  src.account || null;
    dest.online =  (src.online !== undefined ? src.online : true);
    dest.page =
    {
        active:              (srcPage.active        !== undefined ? srcPage.active        : true),
        displayStatus:       (srcPage.displayStatus !== undefined ? srcPage.displayStatus : 'displayed'),
        effect:              dest.page.effect,
        highPriorityEffect:  null,
        direction:           'forward',
        onPageTransitionEnd: srcPage.onPageTransitionEnd
    };
}
