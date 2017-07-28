/**
 * (C) 2016-2017 printf.jp
 */
import {Response}  from 'libs/response';
import {BaseStore} from '../base-store';

export namespace storeNS
{
    export interface Store extends BaseStore
    {
        message?                : string;
        onTwitter?              : () => void;
        onFacebook?             : () => void;
        onGoogle?               : () => void;
        onGithub?               : () => void;
        onEmail?                : () => void;
        onPassword?             : () => void;
        onAccount?              : () => void;
        onLeave?                : () => void;
        onBack?                 : () => void;
        unlinkProviderResponse? : Response.UnlinkProvider;
    }

    export function init(src : Store) : Store
    {
        const store : Store =
        {
            locale:      src.locale,
            account:     src.account || null,
            message:     src.message || '',
            onTwitter:   src.onTwitter,
            onFacebook:  src.onFacebook,
            onGoogle:    src.onGoogle,
            onGithub:    src.onGithub,
            onEmail:     src.onEmail,
            onPassword:  src.onPassword,
            onAccount:   src.onAccount,
            onLeave:     src.onLeave,
            onBack:      src.onBack,
            unlinkProviderResponse: {status:Response.Status.OK, message:{}}
        };
        return store;
    }
}
