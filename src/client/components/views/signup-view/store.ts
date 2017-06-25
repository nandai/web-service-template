/**
 * (C) 2016-2017 printf.jp
 */
import {Response} from 'libs/response';

export interface Store
{
    locale              : string;
    email?              : string;
    password?           : string;
    message?            : string;
    signupEmailResponse : Response.SignupEmail;
    onTwitter?          : () => void;
    onFacebook?         : () => void;
    onGoogle?           : () => void;
    onGithub?           : () => void;
    onEmailChange?      : (value : string) => void;
    onPasswordChange?   : (value : string) => void;
    onSignup?           : () => void;
    onTop?              : () => void;
}
