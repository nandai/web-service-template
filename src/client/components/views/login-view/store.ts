/**
 * (C) 2016-2017 printf.jp
 */
import {Response}  from 'libs/response';
import {BaseStore} from '../base-store';

export namespace storeNS
{
    export interface Store extends BaseStore
    {
        name?               : string;
        email?              : string;
        password?           : string;
        message?            : string;
        onTwitter?          : () => void;
        onFacebook?         : () => void;
        onGoogle?           : () => void;
        onGithub?           : () => void;
        onEmailChange?      : (value : string) => void;
        onPasswordChange?   : (value : string) => void;
        onLogin?            : () => void;
        onSignup?           : () => void;
        onForget?           : () => void;
        onUsers?            : () => void;
        onHome?             : () => void;
        onAbout?            : () => void;
        loginEmailResponse? : Response.LoginEmail;
    }

    export function init(src : Store) : Store
    {
        const store : Store =
        {
            locale:             src.locale,
            account:            null,
            name:               src.name,
            email:              '',
            password:           '',
            message:            src.message || '',
            onTwitter:          src.onTwitter,
            onFacebook:         src.onFacebook,
            onGoogle:           src.onGoogle,
            onGithub:           src.onGithub,
            onEmailChange:      src.onEmailChange,
            onPasswordChange:   src.onPasswordChange,
            onLogin:            src.onLogin,
            onSignup:           src.onSignup,
            onForget:           src.onForget,
            onUsers:            src.onUsers,
            onHome:             src.onHome,
            onAbout:            src.onAbout,
            loginEmailResponse: {status:Response.Status.OK, message:{}}
        };
        return store;
    }
}
