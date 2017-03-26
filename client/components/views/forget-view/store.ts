/**
 * (C) 2016-2017 printf.jp
 */
export interface Store
{
    email         : string;
    message       : string;
    onEmailChange : (e : React.ChangeEvent<HTMLInputElement>) => void;
    onSend        : () => void;
}
