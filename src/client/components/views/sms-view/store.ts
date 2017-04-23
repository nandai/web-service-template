/**
 * (C) 2016-2017 printf.jp
 */
export interface Store
{
    locale           : string;
    smsCode?         : string;
    message?         : string;
    onSmsCodeChange? : (e : React.ChangeEvent<HTMLInputElement>) => void;
    onSend?          : () => void;
}
