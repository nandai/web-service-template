/**
 * (C) 2016-2017 printf.jp
 */
import {graphql}             from 'graphql';

import {Response}            from 'libs/response';
import {slog}                from 'libs/slog';
import AccountAgent          from 'server/agents/account-agent';
import Converter             from 'server/libs/converter';
import {GraphqlRoot, schema} from 'server/libs/graphql-root';

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

export function getUserListForGraphQL()
{
    return new Promise(async (resolve : (data : Response.GetUserList) => void, reject) =>
    {
        const log = slog.stepIn('UserApi', 'getUserListForGraphQL');
        try
        {
            const result = await graphql(schema, `query {userList {id, accountName, name}}`, GraphqlRoot);
            const data = result.data as Response.GetUserList;

            log.stepOut();
            resolve(data);
        }
        catch (err) {log.stepOut(); reject(err);}
    });
}
