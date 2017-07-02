/**
 * (C) 2016-2017 printf.jp
 */
import {Response} from 'libs/response';

export interface Store
{
    locale             : string;
    name               : string;
    email              : string;
    password           : string;
    loginEmailResponse : Response.LoginEmail;
    message?           : string;
    onTwitter?         : () => void;
    onFacebook?        : () => void;
    onGoogle?          : () => void;
    onGithub?          : () => void;
    onEmailChange?     : (value : string) => void;
    onPasswordChange?  : (value : string) => void;
    onLogin?           : () => void;
    onSignup?          : () => void;
    onForget?          : () => void;
    onUsers?           : () => void;
    onHome?            : () => void;
    onAbout?           : () => void;
}
