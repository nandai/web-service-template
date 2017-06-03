/**
 * (C) 2016-2017 printf.jp
 */
export interface Store
{
    locale            : string;
    password          : string;
    message           : string;
    onPasswordChange? : (value : string) => void;
    onChange?         : () => void;
}
