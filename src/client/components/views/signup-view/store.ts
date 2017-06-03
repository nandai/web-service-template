/**
 * (C) 2016-2017 printf.jp
 */
export interface Store
{
    locale            : string;
    email?            : string;
    password?         : string;
    message?          : string;
    onTwitter?        : () => void;
    onFacebook?       : () => void;
    onGoogle?         : () => void;
    onGithub?         : () => void;
    onEmailChange?    : (value : string) => void;
    onPasswordChange? : (value : string) => void;
    onSignup?         : () => void;
    onTop?            : () => void;
}
