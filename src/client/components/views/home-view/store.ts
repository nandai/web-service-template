/**
 * (C) 2016-2017 printf.jp
 */
import {Response}                 from 'libs/response';
import {BaseStore, initBaseStore} from '../base-store';

export namespace storeNS
{
    export interface Store extends BaseStore
    {
        name?        : 'login' | 'signup' | 'about';
        onLogin?     : () => void;
        onSignup?    : () => void;
        onAbout?     : () => void;

        loginStore?  : LoginStore;
        signupStore? : SignupStore;
        aboutStore?  : BaseStore;
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
        onForget?           : () => void;
        onUsers?            : () => void;
        loginEmailResponse? : Response.LoginEmail;
    }

    export interface SignupStore extends BaseStore
    {
        email?               : string;
        password?            : string;
        message?             : string;
        loading?             : boolean;
        onTwitter?           : () => void;
        onFacebook?          : () => void;
        onGoogle?            : () => void;
        onGithub?            : () => void;
        onEmailChange?       : (value : string) => void;
        onPasswordChange?    : (value : string) => void;
        onSignup?            : () => void;
        onBack?              : () => void;
        signupEmailResponse? : Response.SignupEmail;
    }

    export function init(src : Store) : Store
    {
        // LoginStore
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
            onForget:           srcLoginStore.onForget,
            onUsers:            srcLoginStore.onUsers,
            loginEmailResponse: {status:Response.Status.OK, message:{}},
        };
        initBaseStore(loginStore, src);

        // SignupStore
        const srcSignupStore = src.signupStore || {};
        const signupStore : SignupStore =
        {
            page:                {effect:'slide'},
            email:               '',
            password:            '',
            message:             srcSignupStore.message,
            loading:             false,
            onTwitter:           srcSignupStore.onTwitter,
            onFacebook:          srcSignupStore.onFacebook,
            onGoogle:            srcSignupStore.onGoogle,
            onGithub:            srcSignupStore.onGithub,
            onEmailChange:       srcSignupStore.onEmailChange,
            onPasswordChange:    srcSignupStore.onPasswordChange,
            onSignup:            srcSignupStore.onSignup,
            onBack:              srcSignupStore.onBack,
            signupEmailResponse: {status:Response.Status.OK, message:{}}
        };
        initBaseStore(signupStore, src);

        // AboutStore
        const aboutStore : BaseStore =
        {
            page: {effect:'slide'}
        };
        initBaseStore(aboutStore, src);

        // HomeStore
        const store : Store =
        {
            page:     {effect:'fade'},
            name:     src.name,
            onLogin:  src.onLogin,
            onSignup: src.onSignup,
            onAbout:  src.onAbout,

            loginStore,
            signupStore,
            aboutStore
        };
        initBaseStore(store, src);

        return store;
    }
}
