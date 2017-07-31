/**
 * (C) 2016-2017 printf.jp
 */
import {Data}  from './data';
import {Route} from './route';

/**
 * カレントRoute設定
 */
export function setCurrentRoute(data : Data, route : Route) : void
{
    if (data.currentRoute === null)
    {
        // 初回設定時
        data.currentRoute = route;
    }
    else
    {
        // 二度目以降
        if (data.currentRoute.app !== route.app)
        {
            // 非アクティブ化
            data.currentRoute.app.store.active = false;

            // アクティブ化準備
            route.app.store.active = false;
            route.app.store.displayStatus = 'preparation';
        }
        data.currentRoute = route;
    }
}
