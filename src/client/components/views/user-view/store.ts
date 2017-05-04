/**
 * (C) 2016-2017 printf.jp
 */
import {Response} from 'libs/response';

export interface Store
{
    locale  : string;
    user    : Response.User;
    onBack? : () => void;
}
