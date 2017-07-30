/**
 * (C) 2016-2017 printf.jp
 */
import {App} from '../app';

/**
 * URL route
 */
export interface Route
{
    url    : string;
    app    : App;
    title  : string;
    effect : string;
    query? : boolean;
    auth?  : boolean;
}
