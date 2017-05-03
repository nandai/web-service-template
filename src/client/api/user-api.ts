/**
 * (C) 2016-2017 printf.jp
 */
import Api        from './api';
import {Response} from 'libs/response';

const slog = window['slog'];

export default class UserApi extends Api
{
    private static CLS_NAME_2 = '(client)UserApi';

    /**
     * ユーザー一覧取得
     */
    static getUserList()
    {
        return new Promise(async (resolve : (res : Response.GetUserList) => void, reject) =>
        {
            const log = slog.stepIn(UserApi.CLS_NAME_2, 'getUserList');
            const url = `/api/users`;

            const {ok, data} = await Api.sendPostRequest(url, {});
            log.stepOut();
            Api.result(ok, data, resolve, reject);
        });
    }
}
