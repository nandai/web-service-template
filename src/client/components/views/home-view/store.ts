/**
 * (C) 2016-2017 printf.jp
 */
import {Response}                 from 'libs/response';
import {BaseStore, initBaseStore} from '../base-store';

export namespace storeNS
{
    export interface Store extends BaseStore
    {
        name?       : 'login' | 'about';
        onLogin?    : () => void;
        onAbout?    : () => void;

        loginStore? : LoginStore;
        aboutStore? : BaseStore;
    }

    export interface LoginStore extends BaseStore
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
        onSignup?           : () => void;
        onForget?           : () => void;
        onUsers?            : () => void;
        loginEmailResponse? : Response.LoginEmail;
    }

    export function init(src : Store) : Store
    {
        const srcLoginStore = src.loginStore || {};

        const loginStore : LoginStore =
        {
            page:               {effect:'slide'},
            email:              '',
            password:           '',
            message:            srcLoginStore.message || '',
            onTwitter:          srcLoginStore.onTwitter,
            onFacebook:         srcLoginStore.onFacebook,
            onGoogle:           srcLoginStore.onGoogle,
            onGithub:           srcLoginStore.onGithub,
            onEmailChange:      srcLoginStore.onEmailChange,
            onPasswordChange:   srcLoginStore.onPasswordChange,
            onLogin:            srcLoginStore.onLogin,
            onSignup:           srcLoginStore.onSignup,
            onForget:           srcLoginStore.onForget,
            onUsers:            srcLoginStore.onUsers,
            loginEmailResponse: {status:Response.Status.OK, message:{}},
        };
        initBaseStore(loginStore, src);

        const aboutStore : BaseStore =
        {
            page: {effect:'slide'}
        };
        initBaseStore(aboutStore, src);

        const store : Store =
        {
            page:    {effect:'fade'},
            name:    src.name,
            onLogin: src.onLogin,
            onAbout: src.onAbout,

            loginStore,
            aboutStore
        };
        initBaseStore(store, src);

        return store;
    }
}
