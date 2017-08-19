/**
 * (C) 2016-2017 printf.jp
 */
import {Direction} from 'client/libs/history';

export namespace pageNS
{
    export type Effect = 'fade' | 'slide';
    type DisplayStatus = 'hidden' | 'preparation' | 'showing' | 'displayed';

    export interface Page
    {
        active?              : boolean;
        displayStatus?       : DisplayStatus;
        effect?              : Effect;
        highPriorityEffect?  : Effect;
        direction?           : Direction;
        onPageTransitionEnd? : (page : Page) => void;
    }

    export function factory(srcPage : Page, effect : Effect) : Page
    {
        srcPage = srcPage || {};
        const page : Page =
        {
            active:              (srcPage.active        !== undefined ? srcPage.active        : true),
            displayStatus:       (srcPage.displayStatus !== undefined ? srcPage.displayStatus : 'displayed'),
            effect,
            highPriorityEffect:  null,
            direction:           'forward',
            onPageTransitionEnd: srcPage.onPageTransitionEnd
        };
        return page;
    }
}
