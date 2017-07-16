/**
 * (C) 2016-2017 printf.jp
 */
import {Response} from 'libs/response';
import R          from 'server/libs/r';

/**
 * パスワード検証
 *
 * @param   password    パスワード
 * @param   confirm     確認用パスワード（undefined可）
 */
export function password(args : {password : string, confirm? : string, canNull? : boolean}, locale : string)
{
    const {confirm, canNull} = args;
    const _password = args.password;
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

        if (_password === null)
        {
            if (confirm === undefined || canNull !== true)
            {
                result.status = Response.Status.FAILED;
                result.password = R.text(R.PASSWORD_TOO_SHORT_OR_TOO_LONG, locale, {min, max});
            }
        }
        else
        {
            const len = _password.length;
            if (len < min || max < len)
            {
                result.status = Response.Status.FAILED;
                result.password = R.text(R.PASSWORD_TOO_SHORT_OR_TOO_LONG, locale, {min, max});
            }
            else if (_password.match(/^[0-9a-zA-Z@]+$/) === null)
            {
                result.status = Response.Status.FAILED;
                result.password = R.text(R.ENTER_ALPHABETICAL_NUMBER, locale);
            }
        }

        // 確認用パスワードが一致するか
        if (confirm !== undefined && _password !== confirm)
        {
            result.status = Response.Status.FAILED;
            result.confirm = R.text(R.MISMATCH_PASSWORD, locale);
        }
    }
    while (false);
    return (result);
}
