/**
 * (C) 2016-2017 printf.jp
 */
import {Response} from 'libs/response';
import {Account}  from 'server/models/account';

export default class Converter
{
    static accountToResponse(account : Account) : Response.Account
    {
        if (account === null) {
            return null;
        }

        const response : Response.Account =
        {
            name:          account.name,
            userName:      account.user_name,
            email:         account.email,
            countryCode:   account.country_code,
            phoneNo:       account.phone_no,
            twoFactorAuth: account.two_factor_auth,
            twitter:      (account.twitter  !== null),
            facebook:     (account.facebook !== null),
            google:       (account.google   !== null),
            github:       (account.github   !== null)
        };
        return response;
    }
}
