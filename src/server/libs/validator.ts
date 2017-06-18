/**
 * (C) 2016-2017 printf.jp
 */
import {Response} from 'libs/response';
import R          from 'server/libs/r';
import {Account}  from 'server/models/account';

export default class Validator
{
    /**
     * ユーザー名検証
     */
    static userName(userName : string, accountId : number, alreadyExistsAccount : Account, locale : string)
    {
        let status = Response.Status.OK;
        let message : string;

        do
        {
            if (! userName) {
                break;
            }

            if (userName !== userName.trim())
            {
                status = Response.Status.FAILED;
                message = R.text(R.CANNOT_ENTER_USER_NAME_BEFORE_AFTER_SPACE, locale);
                break;
            }

            const len = userName.length;
            if (len < 0 || 20 < len)
            {
                status = Response.Status.FAILED;
                message = R.text(R.USER_NAME_TOO_LONG, locale, {min:0, max:20});
                break;
            }

            if (userName && isNaN(Number(userName)) === false)
            {
                status = Response.Status.FAILED;
                message = R.text(R.CANNOT_ENTER_USER_NAME_ONLY_NUMBERS, locale);
                break;
            }

            if (userName.match(/^[0-9a-zA-Z-_]+$/) === null)
            {
                status = Response.Status.FAILED;
                message = R.text(R.ENTER_ALPHABETICAL_NUMBER, locale);
                break;
            }

            if (alreadyExistsAccount && alreadyExistsAccount.id !== accountId)
            {
                status = Response.Status.FAILED;
                message = R.text(R.ALREADY_USE_USER_NAME, locale);
                break;
            }
        }
        while (false);
        return ({status, message});
    }

    /**
     * パスワード検証
     *
     * @param   password    パスワード
     */
    static password(password : string, locale : string)
    {
        let status = Response.Status.OK;
        let message : string;

        do
        {
            const min = 8;
            const max = 16;

            if (! password)
            {
                status = Response.Status.FAILED;
                message = R.text(R.PASSWORD_TOO_SHORT_OR_TOO_LONG, locale);
                break;
            }

            const len = password.length;
            if (len < min || max < len)
            {
                status = Response.Status.FAILED;
                message = R.text(R.PASSWORD_TOO_SHORT_OR_TOO_LONG, locale);
                break;
            }
        }
        while (false);
        return ({status, message});
    }
}
