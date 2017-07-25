/**
 * (C) 2016-2017 printf.jp
 */
import {slog} from 'libs/slog';

export default class History
{
    private static onPushState : (direction : string, massage? : string) => void = null;
    private static count = 0;

    static setCallback(callback : (direction : string, massage? : string) => void)
    {
        History.onPushState = callback;
        // window['historyCallback'] = callback;
        window.addEventListener('popstate', History.onPopState);
    }

    private static getCallback() : (direction : string, massage? : string) => void
    {
        return History.onPushState;
        // return window['historyCallback'];
    }

    static pushState(url : string, message? : string) : void
    {
        const log = slog.stepIn('History', 'pushState');
        if (location.pathname + location.search !== url)
        {
            History.count++;
            history.pushState(History.count, null, url);
        }

        // location.pathname + location.search === url であってもonPushStateはコールする
        const callback = History.getCallback();
        if (callback) {
            callback('forward', message);
        }
        log.stepOut();
    }

    static replaceState(url : string) : void
    {
        const log = slog.stepIn('History', 'replaceState');
        history.replaceState(History.count, null, url);

        const callback = History.getCallback();
        if (callback) {
            callback('forward');
        }
        log.stepOut();
    }

    static back() : void
    {
        // History.count--;
        history.back();

        // const callback = History.getCallback();
        // if (callback) {
        //     console.log('back()');
        //     callback('back');
        // }
    }

    private static onPopState(e : PopStateEvent) : void
    {
        // console.log('count:' + History.count);
        let direction : string;

        if (e.state > History.count)
        {
            History.count++;
            direction = 'forward';
        }
        else
        {
            History.count--;
            direction = 'back';
        }

        const callback = History.getCallback();
        if (callback) {
            callback(direction);
        }
    }
}
