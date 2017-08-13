/**
 * (C) 2016-2017 printf.jp
 */
import {Response}                 from 'libs/response';
import {BaseStore, initBaseStore} from '../base-store';

export namespace storeNS
{
    export interface Store extends BaseStore
    {
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
        onForget?           : () => void;
        onUsers?            : () => void;
        loginEmailResponse? : Response.LoginEmail;
    }

    export function init(src : Store) : Store
    {
        const store : Store =
        {
            page:               {effect:'slide'},
            email:              src.email    || '',
            password:           src.password || '',
            message:            src.message  || '',
            onTwitter:          src.onTwitter,
            onFacebook:         src.onFacebook,
            onGoogle:           src.onGoogle,
            onGithub:           src.onGithub,
            onEmailChange:      src.onEmailChange,
            onPasswordChange:   src.onPasswordChange,
            onLogin:            src.onLogin,
            onForget:           src.onForget,
            onUsers:            src.onUsers,
            loginEmailResponse: {status:Response.Status.OK, message:{}},
        };
        initBaseStore(store, src);
        return store;
    }
}
