/**
 * (C) 2016-2017 printf.jp
 */
export interface Store
{
    smsCode         : string;
    message         : string;
    onSmsCodeChange : (e : React.ChangeEvent<HTMLInputElement>) => void;
    onSend          : () => void;
}
