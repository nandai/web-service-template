/**
 * (C) 2016-2017 printf.jp
 */
import {Response} from 'libs/response';

import _ = require('lodash');

export type Effect = 'fade' | 'slide' | 'none';

export interface BaseStore
{
    locale?          : string;
    account?         : Response.Account;
    online?          : boolean;
    active?          : boolean;
    show?            : boolean[];
    effect?          : Effect;
    prevPathName?    : string;
    onTransitionEnd? : () => void;
}

export function initBaseStore(dest : BaseStore, src : BaseStore) : void
{
    dest.locale =          src.locale;
    dest.account =         src.account || null;
    dest.online =         (src.online !== undefined ? src.online : true);
    dest.active =         (src.active !== undefined ? src.active : true);
    dest.show =           (src.show   !== undefined ? _.clone(src.show) : [true, true]);
//  dest.effect =         (src.effect !== undefined ? src.effect : 'none');
    dest.onTransitionEnd = null;
}
