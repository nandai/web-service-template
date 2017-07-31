/**
 * (C) 2016-2017 printf.jp
 */
import {Response}                 from 'libs/response';
import {BaseStore, initBaseStore} from '../base-store';

export namespace storeNS
{
    export interface Store extends BaseStore
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
        onTop?               : () => void;
        signupEmailResponse? : Response.SignupEmail;
    }

    export function init(src : Store) : Store
    {
        const store : Store =
        {
            effect:              'fade',
            email:               '',
            password:            '',
            message:             src.message,
            loading:             false,
            onTwitter:           src.onTwitter,
            onFacebook:          src.onFacebook,
            onGoogle:            src.onGoogle,
            onGithub:            src.onGithub,
            onEmailChange:       src.onEmailChange,
            onPasswordChange:    src.onPasswordChange,
            onSignup:            src.onSignup,
            onTop:               src.onTop,
            signupEmailResponse: {status:Response.Status.OK, message:{}}
        };
        initBaseStore(store, src);
        return store;
    }
}
