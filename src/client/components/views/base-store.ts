/**
 * (C) 2016-2017 printf.jp
 */
import {Response} from 'libs/response';

export type Effect = 'fade' | 'slide' | 'none';

export interface BaseStore
{
    locale?          : string;
    account?         : Response.Account;
    online?          : boolean;
    active?          : boolean;
    displayStatus?   : 'hidden' | 'preparation' | 'showing' | 'displayed';
    effect?          : Effect;
    prevPathName?    : string;
    onTransitionEnd? : () => void;
}

export function initBaseStore(dest : BaseStore, src : BaseStore) : void
{
    dest.locale =          src.locale;
    dest.account =         src.account || null;
    dest.online =         (src.online        !== undefined ? src.online        : true);
    dest.active =         (src.active        !== undefined ? src.active        : true);
    dest.displayStatus =  (src.displayStatus !== undefined ? src.displayStatus : 'displayed');
//  dest.effect =         (src.effect !== undefined ? src.effect : 'none');
    dest.onTransitionEnd = null;
}
