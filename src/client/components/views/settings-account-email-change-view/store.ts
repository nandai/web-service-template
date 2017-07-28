/**
 * (C) 2016-2017 printf.jp
 */
import {Response}                 from 'libs/response';
import {BaseStore, initBaseStore} from '../base-store';

export namespace storeNS
{
    export interface Store extends BaseStore
    {
        password?            : string;
        message?             : string;
        onPasswordChange?    : (value : string) => void;
        onChange?            : () => void;
        changeEmailResponse? : Response.ChangeEmail;
    }

    export function init(src : Store) : Store
    {
        const store : Store =
        {
            password:            '',
            message:             '',
            onPasswordChange:    src.onPasswordChange,
            onChange:            src.onChange,
            changeEmailResponse: {status:Response.Status.OK, message:{}}
        };
        initBaseStore(store, src);
        return store;
    }
}
