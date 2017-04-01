/**
 * (C) 2016-2017 printf.jp
 */
export namespace Response
{
    export interface Account
    {
        status   : number;
        name     : string;
        email    : string;
        phoneNo  : string;
        twitter  : boolean;
        facebook : boolean;
        google   : boolean;
    }
}
