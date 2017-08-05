/**
 * (C) 2016-2017 printf.jp
 */
import Apps    from 'client/app/apps';
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
        data.apps = new Apps(route.app);
    }
    else
    {
        // 二度目以降
        data.apps.setNextApp(route.app);
    }

    data.currentRoute = route;
}
