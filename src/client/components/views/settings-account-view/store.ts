/**
 * (C) 2016-2017 printf.jp
 */
import {Response} from 'libs/response';

export interface Store
{
    locale               : string;
    account              : Response.Account;
    setAccountResponse   : Response.SetAccount;
    message              : string;
    onNameChange?        : (value : string) => void;
    onUserNameChange?    : (value : string) => void;
    onPhoneNoChange?     : (value : string) => void;
    onCountryCodeChange? : (value : string) => void;
    onTwoFactorAuth?     : (twoFactorAuth : string) => void;
    onChange?            : () => void;
    onBack?              : () => void;
}
