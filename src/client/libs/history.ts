/**
 * (C) 2016-2017 printf.jp
 */
import {slog} from 'libs/slog';

export type Direction = 'forward' | 'back';

interface HistoryHandler
{
    (massage? : string) : void;
}

/**
 * Browser History
 */
export default class History
{
    private static onHistory : HistoryHandler = null;
    private static count = 0;
    private static isBack = false;
    static referrerUrl = '';
    static currentUrl = (typeof location !== 'undefined' ? location.pathname : '');
    static direction : Direction;

    /**
     * コールバック設定
     */
    static setCallback(onHistory : HistoryHandler)
    {
        History.onHistory = onHistory;
        window.addEventListener('popstate', History.onEvent);
    }

    /**
     * emit
     */
    private static emit(direction : Direction, message? : string) : void
    {
        History.referrerUrl = History.currentUrl;
        History.currentUrl =  location.pathname;
        History.direction =   direction;

        if (History.onHistory) {
            History.onHistory(message);
        }
    }

    /**
     * pushState
     */
    static pushState(url : string, message? : string) : void
    {
        const log = slog.stepIn('History', 'pushState');
        if (location.pathname + location.search !== url)
        {
            History.count++;
            history.pushState(History.count, null, url);
        }

        History.emit('forward', message);
        log.stepOut();
    }

    /**
     * replaceState
     */
    static replaceState(url : string) : void
    {
        const log = slog.stepIn('History', 'replaceState');
        history.replaceState(History.count, null, url);

        History.emit('forward');
        log.stepOut();
    }

    /**
     * back
     */
    static back() : void
    {
        History.isBack = true;
        history.back();
    }

    /**
     * onEvent
     */
    private static onEvent(e : PopStateEvent) : void
    {
        const log = slog.stepIn('History', 'onEvent');
        // log.d('count:' + History.count);
        let direction : Direction;

        if (e.state > History.count && History.isBack === false)
        {
            History.count++;
            direction = 'forward';
        }
        else
        {
            History.count--;
            History.isBack = false;
            direction = 'back';
        }

        History.emit(direction);
        log.stepOut();
    }
}
