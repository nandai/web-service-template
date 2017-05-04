/**
 * (C) 2016-2017 printf.jp
 */
import Api        from './api';
import {Request}  from 'libs/request';
import {Response} from 'libs/response';

const slog = window['slog'];

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
}
