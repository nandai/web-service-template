/**
 * (C) 2016-2017 printf.jp
 */
import {Response} from 'libs/response';

export interface Store
{
    account       : Response.Account;
    message       : string;
    onEmailChange : (e : React.ChangeEvent<HTMLInputElement>) => void;
    onChange      : () => void;
}