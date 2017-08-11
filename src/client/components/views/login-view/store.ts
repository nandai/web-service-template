/**
 * (C) 2016-2017 printf.jp
 */
import {Response}                 from 'libs/response';
import {BaseStore, initBaseStore} from '../base-store';

export namespace storeNS
{
    export interface Store extends BaseStore
    {
        name?       : 'home' | 'about';
        onHome?     : () => void;
        onAbout?    : () => void;

        homeStore?  : HomeStore;
        aboutStore? : BaseStore;
    }

    export interface HomeStore extends BaseStore
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
        const srcHomeStore = src.homeStore || {};

        const homeStore : HomeStore =
        {
            page:               {effect:'slide'},
            email:              '',
            password:           '',
            message:            srcHomeStore.message || '',
            onTwitter:          srcHomeStore.onTwitter,
            onFacebook:         srcHomeStore.onFacebook,
            onGoogle:           srcHomeStore.onGoogle,
            onGithub:           srcHomeStore.onGithub,
            onEmailChange:      srcHomeStore.onEmailChange,
            onPasswordChange:   srcHomeStore.onPasswordChange,
            onLogin:            srcHomeStore.onLogin,
            onSignup:           srcHomeStore.onSignup,
            onForget:           srcHomeStore.onForget,
            onUsers:            srcHomeStore.onUsers,
            loginEmailResponse: {status:Response.Status.OK, message:{}},
        };
        initBaseStore(homeStore, src);

        const aboutStore : BaseStore =
        {
            page: {effect:'slide'}
        };
        initBaseStore(aboutStore, src);

        const store : Store =
        {
            page:    {effect:'fade'},
            name:    src.name,
            onHome:  src.onHome,
            onAbout: src.onAbout,

            homeStore,
            aboutStore
        };
        initBaseStore(store, src);

        return store;
    }
}
