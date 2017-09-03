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

        let route =       routeResult.route;
        let targetApp =   routeResult.targetApp;
        const params =    routeResult.params;
        const title = targetApp.title;

        if (data.targetApp !== targetApp)
        {
            log.d(title);
            if (isInit)
            {
                try
                {
                    await route.app.init(params, message);
                    setCurrentRoute(data, targetApp, route);
                }
                catch (err)
                {
                    console.warn(err.message);
                    routeResult = getRoute(data, '404');
                    route =     routeResult.route;
                    targetApp = routeResult.targetApp;
                    setCurrentRoute(data, targetApp, route);
                }
            }
            else
            {
                setCurrentRoute(data, targetApp, route);
            }
        }

        document.title = title;
        log.stepOut();
        resolve();
    });
}
