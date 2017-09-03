/**
 * (C) 2016-2017 printf.jp
 */
import {Response} from 'libs/response';

import {App}      from 'client/app/app';
import Apps       from 'client/app/apps';
import {Route}    from './route';

export interface Data
{
    apps         : Apps;
    targetApp    : App;
    currentRoute : Route;
    routes       : Route[];
    account      : Response.Account;
}
