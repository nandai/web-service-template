/**
 * (C) 2016-2017 printf.jp
 */
import {Response} from 'libs/response';
import {Route}    from './route';

export interface Data
{
    currentRoute : Route;
    routes       : Route[];
    account      : Response.Account;
    rootEffect   : string;
}
