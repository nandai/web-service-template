/**
 * (C) 2016-2017 printf.jp
 */
export interface Store
{
    message    : string;
    onSettings : () => void;
    onLogout   : () => void;
}
