/**
 * (C) 2016-2017 printf.jp
 */
import {slog}            from 'libs/slog';
import {Data}            from './data';
import {getRoute}        from './getRoute';
import {setCurrentRoute} from './setCurrentRoute';

/**
 * カレントRoute更新
 *
 * @param   url     URL
 * @param   isInit  app.init()をコールするかどうか。初回（DOMContentLoaded時）は不要（SSR Storeを使用してレンダリングするため）
 */
export function updateCurrentRoute(data : Data, url : string, isInit : boolean, message? : string)
{
    const log = slog.stepIn('WstApp', 'updateCurrentRoute');
    return new Promise(async (resolve : () => void) =>
    {
        let routeResult = getRoute(data, url);
        if (routeResult.route === null) {
            routeResult = getRoute(data, '404');
        }

        let route =    routeResult.route;
        const params = routeResult.params;
        const title = route.app.getTitle(url) || route.app.title;

        if (data.currentRoute !== route)
        {
            log.d(title);
            if (isInit)
            {
                try
                {
                    await route.app.init(params, message);
                    setCurrentRoute(data, route);
                }
                catch (err)
                {
                    console.warn(err.message);
                    routeResult = getRoute(data, '404');
                    route = routeResult.route;
                    setCurrentRoute(data, route);
                }
            }
            else
            {
                setCurrentRoute(data, route);
            }
        }

        document.title = title;
        log.stepOut();
        resolve();
    });
}
