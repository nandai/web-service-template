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
        data.currentRoute = route;
    }
    else
    {
        data.currentRoute.app.store.active = false;

        route.app.store.active = false;
        route.app.store.show[0] = false;
        route.app.store.show[1] = true;
        data.currentRoute = route;
    }
}
