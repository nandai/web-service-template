/**
 * (C) 2016-2017 printf.jp
 */
import {pageNS}                   from 'client/libs/page';
import {Response}                 from 'libs/response';
import {BaseStore, initBaseStore} from '../base-store';

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
        onLeaveOK?              : () => void;
        onCloseModal?           : () => void;
        modalPage?              : pageNS.Page;
        unlinkProviderResponse? : Response.UnlinkProvider;
    }

    export function init(src : Store) : Store
    {
        const store : Store =
        {
            page:         {effect:'fade'},
            message:      src.message || '',
            onTwitter:    src.onTwitter,
            onFacebook:   src.onFacebook,
            onGoogle:     src.onGoogle,
            onGithub:     src.onGithub,
            onEmail:      src.onEmail,
            onPassword:   src.onPassword,
            onAccount:    src.onAccount,
            onLeave:      src.onLeave,
            onBack:       src.onBack,
            onLeaveOK:    src.onLeaveOK,
            onCloseModal: src.onCloseModal,
            modalPage:    pageNS.factory(src.modalPage, 'fade'),
            unlinkProviderResponse: {status:Response.Status.OK, message:{}}
        };
        initBaseStore(store, src);

        store.modalPage.active = false;
        store.modalPage.displayStatus = 'hidden';
        return store;
    }
}
