/**
 * (C) 2016-2017 printf.jp
 */
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
        onPageTransitionEnd? : (page : Page) => void;
    }

    export function factory(srcPage : Page, effect : Effect) : Page
    {
        srcPage = srcPage || {};
        const page : Page =
        {
            active:              (srcPage.active        !== undefined ? srcPage.active        : false),
            displayStatus:       (srcPage.displayStatus !== undefined ? srcPage.displayStatus : 'hidden'),
            effect,
            highPriorityEffect:  null,
            onPageTransitionEnd: srcPage.onPageTransitionEnd
        };
        return page;
    }

    /**
     * 次の状態へ
     */
    export function next(page : Page, render : () => void, effectDelay = 0) : void
    {
        if (page.displayStatus === 'hidden')
        {
            page.displayStatus = 'preparation';
            render();

            setTimeout(() =>
            {
                page.active = true;
                page.displayStatus = 'showing';
                render();
            }, effectDelay);
        }

        else if (page.displayStatus === 'showing')
        {
            page.displayStatus = 'displayed';
//          render();
        }

        else if (page.displayStatus === 'displayed')
        {
            if (page.active)
            {
                page.active = false;
            }
            else
            {
                page.displayStatus = 'hidden';
            }
            render();
        }
    }

    export function forceDisplayed(page : Page) : void
    {
        page.active = true;
        page.displayStatus = 'displayed';
    }
}
