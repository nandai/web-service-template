/**
 * (C) 2016-2017 printf.jp
 */
import {App}   from 'client/app/app';
import Utils   from 'client/libs/utils';
import {Data}  from './data';
import {Route} from './route';

/**
 * route取得
 */
export function getRoute(data : Data, url : string)
{
    let route     : Route = null;
    let targetApp : App = null;
    let params;

    for (const _route of data.routes)
    {
        targetApp = _route.app.getTargetApp(url) || _route.app;
        params = Utils.getParamsFromUrl(url, targetApp.url);

        if (params === null) {
            continue;
        }

        if (_route.auth && data.account === null) {
            continue;
        }

        if (_route.query !== true && location.search === '')
        {
            route = _route;
            break;
        }

        if (_route.query === true && location.search !== '')
        {
            route = _route;
            break;
        }
    }

    return {route, targetApp, params};
}
