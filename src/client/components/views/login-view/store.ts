/**
 * (C) 2016-2017 printf.jp
 */
export interface Store
{
    locale            : string;
    name              : string;
    email             : string;
    password          : string;
    message?          : string;
    onTwitter?        : () => void;
    onFacebook?       : () => void;
    onGoogle?         : () => void;
    onEmailChange?    : (e : React.ChangeEvent<HTMLInputElement>) => void;
    onPasswordChange? : (e : React.ChangeEvent<HTMLInputElement>) => void;
    onLogin?          : () => void;
    onSignup?         : () => void;
    onForget?         : () => void;
    onUsers?          : () => void;
    onHome?           : () => void;
    onAbout?          : () => void;
}
