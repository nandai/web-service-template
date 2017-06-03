/**
 * (C) 2016-2017 printf.jp
 */
export interface Store
{
    locale           : string;
    smsCode?         : string;
    message?         : string;
    onSmsCodeChange? : (value : string) => void;
    onSend?          : () => void;
}
