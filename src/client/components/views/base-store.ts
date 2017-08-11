/**
 * (C) 2016-2017 printf.jp
 */
import {Direction} from 'client/libs/history';
import {Response}  from 'libs/response';

export type Effect = 'fade' | 'slide';
type DisplayStatus = 'hidden' | 'preparation' | 'showing' | 'displayed';

interface Page
{
    active?              : boolean;
    displayStatus?       : DisplayStatus;
    effect?              : Effect;
    highPriorityEffect?  : Effect;
    direction?           : Direction;
    onPageTransitionEnd? : (store : BaseStore) => void;
}

export interface BaseStore
{
    locale?  : string;
    account? : Response.Account;
    online?  : boolean;
    page?    : Page;
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
