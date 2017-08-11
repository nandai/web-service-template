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
        editAccount?           : Response.Account;
        message?               : string;
        onNameChange?          : (value : string) => void;
        onUserNameChange?      : (value : string) => void;
        onPhoneNoChange?       : (value : string) => void;
        onCountryCodeChange?   : (value : string) => void;
        onTwoFactorAuth?       : (twoFactorAuth : string) => void;
        onChange?              : () => void;
        onBack?                : () => void;
        setAccountResponse?    : Response.SetAccount;
        checkUserNameResponse? : Response.CheckUserName;
    }

    export function init(src : Store) : Store
    {
        const account = src.account || null;
        const store : Store =
        {
            page:                  {effect:'fade'},
            editAccount:           _.clone(account),
            message:               '',
            onNameChange:          src.onNameChange,
            onUserNameChange:      src.onUserNameChange,
            onPhoneNoChange:       src.onPhoneNoChange,
            onCountryCodeChange:   src.onCountryCodeChange,
            onTwoFactorAuth:       src.onTwoFactorAuth,
            onChange:              src.onChange,
            onBack:                src.onBack,
            setAccountResponse:    {status:Response.Status.OK, message:{}},
            checkUserNameResponse: {status:Response.Status.OK, message:{}}
        };
        initBaseStore(store, src);
        return store;
    }
}
