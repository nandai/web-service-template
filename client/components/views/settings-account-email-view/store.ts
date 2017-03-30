/**
 * (C) 2016-2017 printf.jp
 */
export interface Store
{
    account       : any;
    message       : string;
    onEmailChange : (e : React.ChangeEvent<HTMLInputElement>) => void;
    onChange      : () => void;
}
