/**
 * (C) 2016-2017 printf.jp
 */
export interface Store
{
    oldPassword         : string;
    newPassword         : string;
    confirm             : string;
    message             : string;
    onOldPasswordChange : (e : React.ChangeEvent<HTMLInputElement>) => void;
    onNewPasswordChange : (e : React.ChangeEvent<HTMLInputElement>) => void;
    onConfirmChange     : (e : React.ChangeEvent<HTMLInputElement>) => void;
    onChange            : () => void;
}
