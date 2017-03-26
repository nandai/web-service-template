/**
 * (C) 2016-2017 printf.jp
 */
export interface Store
{
    password         : string;
    confirm          : string;
    message          : string;
    onPasswordChange : (e : React.ChangeEvent<HTMLInputElement>) => void;
    onConfirmChange  : (e : React.ChangeEvent<HTMLInputElement>) => void;
    onChange         : () => void;
}
