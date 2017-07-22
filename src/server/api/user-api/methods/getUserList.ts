/**
 * (C) 2016-2017 printf.jp
 */
import {Response}   from 'libs/response';
import {slog}       from 'libs/slog';
import AccountAgent from 'server/agents/account-agent';
import Converter    from 'server/libs/converter';

/**
 * ユーザー一覧取得
 */
export function getUserList()
{
    return new Promise(async (resolve : (data : Response.GetUserList) => void, reject) =>
    {
        const log = slog.stepIn('UserApi', 'getUserList');
        try
        {
            const accountList = await AccountAgent.findList({registered:true});
            const userList = accountList.map((account) =>
            {
                const  user = Converter.accountToUserResponse(account);
                return user;
            });

            const data : Response.GetUserList =
            {
                status: Response.Status.OK,
                userList
            };

            log.stepOut();
            resolve(data);
        }
        catch (err) {log.stepOut(); reject(err);}
    });
}
