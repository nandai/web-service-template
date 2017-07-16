/**
 * (C) 2016-2017 printf.jp
 */
import {Response} from 'libs/response';
import R          from 'server/libs/r';
import {Account}  from 'server/models/account';

/**
 * ユーザー名検証
 */
export function userName(aUserName : string, accountId : number, alreadyExistsAccount : Account, locale : string) : ValidationResult
{
    let status = Response.Status.FAILED;
    let message : string;

    do
    {
        const min = 0;
        const max = 20;

        if (! aUserName)
        {
            status = Response.Status.OK;
            break;
        }

        if (aUserName !== aUserName.trim())
        {
            message = R.text(R.CANNOT_ENTER_USER_NAME_BEFORE_AFTER_SPACE, locale);
            break;
        }

        const len = aUserName.length;
        if (len < min || max < len)
        {
            message = R.text(R.USER_NAME_TOO_LONG, locale, {min, max});
            break;
        }

        if (aUserName && isNaN(Number(aUserName)) === false)
        {
            message = R.text(R.CANNOT_ENTER_USER_NAME_ONLY_NUMBERS, locale);
            break;
        }

        if (aUserName.match(/^[0-9a-zA-Z-_]+$/) === null)
        {
            message = R.text(R.ENTER_ALPHABETICAL_NUMBER_BAR, locale);
            break;
        }

        if (alreadyExistsAccount && alreadyExistsAccount.id !== accountId)
        {
            message = R.text(R.ALREADY_USE_USER_NAME, locale);
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
