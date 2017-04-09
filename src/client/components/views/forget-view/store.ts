/**
 * (C) 2016-2017 printf.jp
 */
export interface Store
{
    locale        : string;
    email         : string;
    message       : string;
    onEmailChange : (e : React.ChangeEvent<HTMLInputElement>) => void;
    onSend        : () => void;
}
