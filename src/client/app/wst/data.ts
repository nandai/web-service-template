/**
 * (C) 2016-2017 printf.jp
 */
import {Response} from 'libs/response';
import Apps       from '../apps';
import {Route}    from './route';

export interface Data
{
    apps         : Apps;
    currentRoute : Route;
    routes       : Route[];
    account      : Response.Account;
    pathName     : string;
}
