/**
 * (C) 2016-2017 printf.jp
 */
import {Response} from 'libs/response';

export interface Store
{
    account          : Response.Account;
    message          : string;
    onNameChange     : (e : React.ChangeEvent<HTMLInputElement>) => void;
    onPhoneNoChange  : (e : React.ChangeEvent<HTMLInputElement>) => void;
    onChange         : () => void;
}