/**
 * (C) 2016-2017 printf.jp
 */
import {Response}     from 'libs/response';
import {Account}      from 'server/models/account';
import {LoginHistory} from 'server/models/login-history';

import moment = require('moment');

export default class Converter
{
    static accountToResponse(account : Account, loginHistory? : LoginHistory) : Response.Account
    {
        if (account === null) {
            return null;
        }

        let loginDt : string = null;
        if (loginHistory)
        {
            let format : string;
            if (typeof loginHistory.login_at === 'string') {
                format = 'YYYY/MM/DD HH:mm:ss';
            }

            const m = moment.utc(loginHistory.login_at, format);
            loginDt = m.toISOString();
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
            github:       (account.github   !== null),
            loginDt
        };
        return response;
    }
}
