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
        let status = Response.Status.FAILED;
        let message : string;

        do
        {
            const min = 0;
            const max = 20;

            if (! userName)
            {
                status = Response.Status.OK;
                break;
            }

            if (userName !== userName.trim())
            {
                message = R.text(R.CANNOT_ENTER_USER_NAME_BEFORE_AFTER_SPACE, locale);
                break;
            }

            const len = userName.length;
            if (len < min || max < len)
            {
                message = R.text(R.USER_NAME_TOO_LONG, locale, {min, max});
                break;
            }

            if (userName && isNaN(Number(userName)) === false)
            {
                message = R.text(R.CANNOT_ENTER_USER_NAME_ONLY_NUMBERS, locale);
                break;
            }

            if (userName.match(/^[0-9a-zA-Z-_]+$/) === null)
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

    /**
     * パスワード検証
     *
     * @param   password    パスワード
     */
    static password(password : string, confirm : string, locale : string)
    {
        let status = Response.Status.FAILED;
        let message : string;
        password = password || '';

        do
        {
            const min = 8;
            const max = 16;

            const len = password.length;
            if (len < min || max < len)
            {
                message = R.text(R.PASSWORD_TOO_SHORT_OR_TOO_LONG, locale, {min, max});
                break;
            }

            if (password.match(/^[0-9a-zA-Z@]+$/) === null)
            {
                message = R.text(R.ENTER_ALPHABETICAL_NUMBER, locale);
                break;
            }

            // パスワード確認検証
            if (confirm !== null && password !== confirm)
            {
                message = R.text(R.MISMATCH_PASSWORD, locale);
                break;
            }

            status = Response.Status.OK;
        }
        while (false);
        return ({status, message});
    }
}
