/**
 * (C) 2016-2017 printf.jp
 */
import {Response} from 'libs/response';
import R          from 'server/libs/r';
import Utils      from 'server/libs/utils';
import {Account}  from 'server/models/account';

import nodeValidator = require('validator');

export default class Validator
{
    /**
     * アカウント名検証
     */
    static accountName(accountName : string, locale : string) : ValidationResult
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

    /**
     * ユーザー名検証
     */
    static userName(userName : string, accountId : number, alreadyExistsAccount : Account, locale : string) : ValidationResult
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
     * メールアドレス検証
     */
    static email(email : string, accountId : number, alreadyExistsAccount : Account, locale : string)
    {
        return new Promise(async (resolve : (result : ValidationResult) => void) =>
        {
            let status = Response.Status.FAILED;
            let message : string;

            do
            {
                if (! email || nodeValidator.isEmail(email) === false)
                {
                    message = R.text(R.INVALID_EMAIL, locale);
                    break;
                }

                if (alreadyExistsAccount && alreadyExistsAccount.id !== accountId)
                {
                    message = R.text(R.ALREADY_EXISTS_EMAIL, locale);
                    break;
                }

                const hostname = email.split('@')[1];
                if (await Utils.existsHost(hostname) === false)
                {
                    message = R.text(R.INVALID_EMAIL, locale);
                    break;
                }

                status = Response.Status.OK;
            }
            while (false);
            resolve({status, message});
        });
    }

    /**
     * パスワード検証
     *
     * @param   password    パスワード
     * @param   confirm     確認用パスワード（undefined可）
     */
    static password(args : {password : string, confirm? : string, canNull? : boolean}, locale : string)
    {
        const {password, confirm, canNull} = args;
        const result =
        {
            status:   Response.Status.OK,
            password: null as string,
            confirm:  null as string
        };

        do
        {
            const min = 8;
            const max = 16;

            if (password === null)
            {
                if (confirm === undefined || canNull !== true)
                {
                    result.status = Response.Status.FAILED;
                    result.password = R.text(R.PASSWORD_TOO_SHORT_OR_TOO_LONG, locale, {min, max});
                }
            }
            else
            {
                const len = password.length;
                if (len < min || max < len)
                {
                    result.status = Response.Status.FAILED;
                    result.password = R.text(R.PASSWORD_TOO_SHORT_OR_TOO_LONG, locale, {min, max});
                }
                else if (password.match(/^[0-9a-zA-Z@]+$/) === null)
                {
                    result.status = Response.Status.FAILED;
                    result.password = R.text(R.ENTER_ALPHABETICAL_NUMBER, locale);
                }
            }

            // 確認用パスワードが一致するか
            if (confirm !== undefined && password !== confirm)
            {
                result.status = Response.Status.FAILED;
                result.confirm = R.text(R.MISMATCH_PASSWORD, locale);
            }
        }
        while (false);
        return (result);
    }
}

interface ValidationResult
{
    status   : Response.Status;
    message? : string;
}
