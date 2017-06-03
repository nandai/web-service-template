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
    onGithub?         : () => void;
    onEmailChange?    : (value : string) => void;
    onPasswordChange? : (value : string) => void;
    onLogin?          : () => void;
    onSignup?         : () => void;
    onForget?         : () => void;
    onUsers?          : () => void;
    onHome?           : () => void;
    onAbout?          : () => void;
}
