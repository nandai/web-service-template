/**
 * (C) 2016-2017 printf.jp
 */
export interface Store
{
    locale         : string;
    email?         : string;
    message?       : string;
    onEmailChange? : (value : string) => void;
    onSend?        : () => void;
    onBack?        : () => void;
}
