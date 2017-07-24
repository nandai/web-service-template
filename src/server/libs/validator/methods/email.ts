/**
 * (C) 2016-2017 printf.jp
 */
import {Response} from 'libs/response';
import {slog}     from 'libs/slog';
import R          from 'server/libs/r';
import Utils      from 'server/libs/utils';
import {Account}  from 'server/models/account';

import nodeValidator = require('validator');

/**
 * メールアドレス検証
 */
export function email(aEmail : string, accountId : number, alreadyExistsAccount : Account, locale : string)
{
    return new Promise(async (resolve : (result : ValidationResult) => void) =>
    {
        const log = slog.stepIn('Validator', 'email');
        let status = Response.Status.FAILED;
        let message : string;

        do
        {
            if (! aEmail || nodeValidator.isEmail(aEmail) === false)
            {
                message = R.text(R.INVALID_EMAIL, locale);
                break;
            }

            if (alreadyExistsAccount && alreadyExistsAccount.id !== accountId)
            {
                message = R.text(R.ALREADY_EXISTS_EMAIL, locale);
                break;
            }

            const hostname = aEmail.split('@')[1];
            if (await Utils.existsHost(hostname) === false)
            {
                message = R.text(R.INVALID_EMAIL, locale);
                break;
            }

            status = Response.Status.OK;
        }
        while (false);

        log.stepOut();
        resolve({status, message});
    });
}

interface ValidationResult
{
    status   : Response.Status;
    message? : string;
}
