/**
 * (C) 2016-2017 printf.jp
 */
declare namespace Express
{
    export interface Request
    {
        ext :
        {
            locale  : string;
            command : string;
            session : any;
        };
    }

    export interface Response
    {
        ext :
        {
//          ok         : (status : number, message? : string) => void;
            error      : (status : number, message  : string) => void;
            badRequest : (locale  : string) => void;
        };
    }
}
