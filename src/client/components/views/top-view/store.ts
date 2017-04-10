/**
 * (C) 2016-2017 printf.jp
 */
export interface Store
{
    locale      : string;
    message     : string;
    onSettings? : () => void;
    onLogout?   : () => void;
}
