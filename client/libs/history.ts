/**
 * (C) 2016-2017 printf.jp
 */
export default class History
{
//  private static onPushState : () => void = null;

    static on(eventName : string, callback : () => void)
    {
        switch (eventName)
        {
            case 'pushstate':
//              History.onPushState = callback;
                window['onPushState'] = callback;
                break;

            case 'popstate':
                window.addEventListener('popstate', callback);
                break;
        }
    }

    static pushState(url : string) : void
    {
        if (location.pathname !== url)
            history.pushState(null, null, url);

        // location.pathname === url であってもonPushStateはコールする
//      const onPushState = History.onPushState;
        const onPushState = window['onPushState'];

        if (onPushState)
            onPushState();
    }

    static replaceState(url : string) : void
    {
        history.replaceState(null, null, url);
    }
}
