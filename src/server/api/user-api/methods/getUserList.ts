/**
 * (C) 2016-2017 printf.jp
 */
import {Response}   from 'libs/response';
import AccountAgent from 'server/agents/account-agent';

import slog = require('server/slog');

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
                const  user : Response.User =
                {
                    id:          account.id,
                    accountName: account.name,
                    name:        account.user_name
                };
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
