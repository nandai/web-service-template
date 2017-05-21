/**
 * (C) 2016-2017 printf.jp
 */
export default class History
{
//  private static onPushState : () => void = null;
    private static count = 0;

    static setCallback(callback : (direction : string, massage? : string) => void)
    {
//      History.onPushState = callback;
        window['historyCallback'] = callback;
        window.addEventListener('popstate', History.onPopState);
    }

    private static getCallback() : (direction : string, massage? : string) => void
    {
        return window['historyCallback'];
    }

    static pushState(url : string, message? : string) : void
    {
        if (location.pathname + location.search !== url) {
            history.pushState(++History.count, null, url);
        }

        // location.pathname + location.search === url であってもonPushStateはコールする
        const callback = History.getCallback();
        if (callback) {
            callback('forward', message);
        }
    }

    static replaceState(url : string) : void
    {
        history.replaceState(History.count, null, url);

        const callback = History.getCallback();
        if (callback) {
            callback('forward');
        }
    }

    static back() : void
    {
        History.count--;
        history.back();

        const callback = History.getCallback();
        if (callback) {
            callback('back');
        }
    }

    static onPopState(e : PopStateEvent) : void
    {
//      console.log('count:' + History.count);
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
