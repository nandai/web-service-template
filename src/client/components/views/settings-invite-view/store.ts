/**
 * (C) 2016-2017 printf.jp
 */
import {Response}                 from 'libs/response';
import {BaseStore, initBaseStore} from '../base-store';

export namespace storeNS
{
    export interface Store extends BaseStore
    {
        email?          : string;
        message?        : string;
        loading?        : boolean;
        onEmailChange?  : (value : string) => void;
        onInvite?       : () => void;
        onBack?         : () => void;
        inviteResponse? : Response.Invite;
    }

    export function init(src : Store) : Store
    {
        const store : Store =
        {
            page:           {effect:'fade'},
            email:          '',
            message:        '',
            loading:        false,
            onEmailChange:  src.onEmailChange,
            onInvite:       src.onInvite,
            onBack:         src.onBack,
            inviteResponse: {status:Response.Status.OK, message:{}}
        };
        initBaseStore(store, src);
        return store;
    }
}
