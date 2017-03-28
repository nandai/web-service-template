/**
 * (C) 2016-2017 printf.jp
 */
export interface Store
{
    account          : any;
    message          : string;
    onNameChange     : (e : React.ChangeEvent<HTMLInputElement>) => void;
    onPhoneNoChange  : (e : React.ChangeEvent<HTMLInputElement>) => void;
    onChange         : () => void;
}
