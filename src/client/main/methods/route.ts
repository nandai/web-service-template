/**
 * (C) 2016-2017 printf.jp
 */
import {App} from 'client/app/app';

/**
 * URL route
 */
export interface Route
{
    url    : string;
    app    : App;
    title  : string;
    query? : boolean;
    auth?  : boolean;
}
