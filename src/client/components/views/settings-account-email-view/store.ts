/**
 * (C) 2016-2017 printf.jp
 */
import {Response}                 from 'libs/response';
import {BaseStore, initBaseStore} from '../base-store';

import _ = require('lodash');

export namespace storeNS
{
    export interface Store extends BaseStore
    {
        editAccount?                : Response.Account;
        message?                    : string;
        loading?                    : boolean;
        onEmailChange?              : (value : string) => void;
        onChange?                   : () => void;
        onBack?                     : () => void;
        requestChangeEmailResponse? : Response.RequestChangeEmail;
    }

    export function init(src : Store) : Store
    {
        const account = src.account || null;
        const store : Store =
        {
            effect:        'fade',
            editAccount:    _.clone(account),
            message:       '',
            loading:       false,
            onEmailChange: src.onEmailChange,
            onChange:      src.onChange,
            onBack:        src.onBack,
            requestChangeEmailResponse: {status:Response.Status.OK, message:{}},
        };
        initBaseStore(store, src);
        return store;
    }
}
