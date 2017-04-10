/**
 * (C) 2016-2017 printf.jp
 */
export interface Store
{
    locale            : string;
    password          : string;
    message           : string;
    onPasswordChange? : (e : React.ChangeEvent<HTMLInputElement>) => void;
    onConfirm?        : () => void;
}
