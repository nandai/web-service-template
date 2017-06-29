/**
 * (C) 2016-2017 printf.jp
 */
import {Response} from 'libs/response';
import R          from 'server/libs/r';

/**
 * アカウント名検証
 */
export function accountName(accountName : string, locale : string) : ValidationResult
{
    let status = Response.Status.FAILED;
    let message : string;
    accountName = accountName || '';

    do
    {
        const min = 1;
        const max = 20;

        if (accountName !== accountName.trim())
        {
            message = R.text(R.CANNOT_ENTER_ACCOUNT_NAME_BEFORE_AFTER_SPACE, locale);
            break;
        }

        const len = accountName.length;
        if (len < min || max < len)
        {
            message = R.text(R.ACCOUNT_NAME_TOO_SHORT_OR_TOO_LONG, locale, {min, max});
            break;
        }

        status = Response.Status.OK;
    }
    while (false);
    return ({status, message});
}

interface ValidationResult
{
    status   : Response.Status;
    message? : string;
}
