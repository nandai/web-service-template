/**
 * (C) 2016-2017 printf.jp
 */
import Utils   from 'client/libs/utils';
import {Data}  from './data';
import {Route} from './route';

/**
 * route取得
 */
export function getRoute(data : Data, url : string)
{
    let route : Route = null;
    let params;

    for (const _route of data.routes)
    {
        params = Utils.getParamsFromUrl(url, _route.url);

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

    return {route, params};
}
