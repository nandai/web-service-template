/**
 * (C) 2016-2017 printf.jp
 */
import {Direction} from 'client/libs/history';
import {Response}  from 'libs/response';

export type Effect = 'fade' | 'slide';

export interface BaseStore
{
    locale?              : string;
    account?             : Response.Account;
    online?              : boolean;
    active?              : boolean;
    displayStatus?       : 'hidden' | 'preparation' | 'showing' | 'displayed';
    effect?              : Effect;
    highPriorityEffect?  : Effect;
    direction?           : Direction;
    onPageTransitionEnd? : () => void;
}

export function initBaseStore(dest : BaseStore, src : BaseStore) : void
{
    dest.locale =          src.locale;
    dest.account =         src.account || null;
    dest.online =         (src.online        !== undefined ? src.online        : true);
    dest.active =         (src.active        !== undefined ? src.active        : true);
    dest.displayStatus =  (src.displayStatus !== undefined ? src.displayStatus : 'displayed');
//  dest.effect;
    dest.highPriorityEffect = null;
    dest.direction =          'forward';
    dest.onPageTransitionEnd = src.onPageTransitionEnd;
}
