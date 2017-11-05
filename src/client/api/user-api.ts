/**
 * (C) 2016-2017 printf.jp
 */
import {Request}  from 'libs/request';
import {Response} from 'libs/response';
import {slog}     from 'libs/slog';
import Api        from './api';

export default class UserApi extends Api
{
    private static CLS_NAME_2 = '(client)UserApi';

    /**
     * ユーザー取得
     */
    static getUser(param : Request.GetUser)
    {
        return new Promise(async (resolve : (res : Response.GetUser) => void, reject) =>
        {
            const log = slog.stepIn(UserApi.CLS_NAME_2, 'getUser');
            const url = `/api/user`;

            const {ok, data} = await Api.sendGetRequest(url, param);
            log.stepOut();
            Api.result(ok, data, resolve, reject);
        });
    }

    static getUserForGraphQL(param : Request.GetUser)
    {
        return new Promise(async (resolve : (res : Response.GetUser) => void, reject) =>
        {
            const log = slog.stepIn(UserApi.CLS_NAME_2, 'getUserForGraphQL');
            const url = `/graphql`;
            let args : string;

            if (isNaN(Number(param.id))) {
                args = `name:"${param.id}"`;
            } else {
                args = `id:${param.id}`;
            }

            const obj = {query: `query {user(${args}) {id, accountName, name}}`};
            const result = await Api.sendPostRequest(url, obj);

            if ('data' in result.data) {
                result.data = result.data.data;
            }

            log.stepOut();
            Api.result(result.ok, result.data, resolve, reject);
        });
    }

    /**
     * ユーザー一覧取得
     */
    static getUserList()
    {
        return new Promise(async (resolve : (res : Response.GetUserList) => void, reject) =>
        {
            const log = slog.stepIn(UserApi.CLS_NAME_2, 'getUserList');
            const url = `/api/users`;

            const {ok, data} = await Api.sendGetRequest(url, {});
            log.stepOut();
            Api.result(ok, data, resolve, reject);
        });
    }

    static getUserListForGraphQL()
    {
        return new Promise(async (resolve : (res : Response.GetUserList) => void, reject) =>
        {
            const log = slog.stepIn(UserApi.CLS_NAME_2, 'getUserListForGraphQL');
            const url = `/graphql`;

            const obj = {query: `query {userList {id, accountName, name}}`};
            const result = await Api.sendPostRequest(url, obj);

            if ('data' in result.data) {
                result.data = result.data.data;
            }

            log.stepOut();
            Api.result(result.ok, result.data, resolve, reject);
        });
    }
}
