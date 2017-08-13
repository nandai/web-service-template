/**
 * (C) 2016-2017 printf.jp
 */
import {storeNS as aboutStoreNS}  from '../about-view/store';
import {BaseStore, initBaseStore} from '../base-store';
import {storeNS as loginStoreNS}  from '../login-view/store';
import {storeNS as signupStoreNS} from '../signup-view/store';

export namespace storeNS
{
    export type Name = 'login' | 'signup' | 'about';

    export interface Store extends BaseStore
    {
        name?        : Name;
        onLogin?     : () => void;
        onSignup?    : () => void;
        onAbout?     : () => void;

        loginStore?  : loginStoreNS .Store;
        signupStore? : signupStoreNS.Store;
        aboutStore?  : aboutStoreNS .Store;
    }

    export function init(src : Store) : Store
    {
        const loginStore = loginStoreNS.init(src.loginStore || {});
        initBaseStore(loginStore, src);

        const signupStore = signupStoreNS.init(src.signupStore || {});
        initBaseStore(signupStore, src);

        const aboutStore = aboutStoreNS.init(src.aboutStore || {});
        initBaseStore(aboutStore, src);

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
