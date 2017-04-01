/**
 * (C) 2016-2017 printf.jp
 */
declare namespace Express
{
    export interface Response
    {
        ext : Extension;
    }

    interface Extension
    {
        ok    : (status : number, message? : string) => void;
        error : (status : number, message  : string) => void;
    }
}
