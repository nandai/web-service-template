/**
 * (C) 2016-2017 printf.jp
 */
import {Response}   from 'libs/response';
import AccountModel from 'server/models/account-model';

import slog =    require('server/slog');

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
            const accountList = await AccountModel.findList({registered:true});
            const userList = accountList.map((account) =>
            {
                const  user : Response.User = {id:account.id, name:account.name};
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
