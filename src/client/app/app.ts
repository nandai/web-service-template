/**
 * (C) 2016-2017 printf.jp
 */
import {Response} from 'libs/response';

export abstract class App
{
    setAccount : (account : Response.Account) => void;

    init() : void
    {
    }

    abstract render() : void;
}
