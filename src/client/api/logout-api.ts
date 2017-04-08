/**
 * (C) 2016-2017 printf.jp
 */
import Api       from './api';
import {Request} from 'libs/request';

const slog = window['slog'];

export default class LogoutApi extends Api
{
    private static CLS_NAME_2 = '(client)LogoutApi';

    /**
     * ログアウト
     */
    static logout()
    {
        return new Promise(async (resolve : () => void, reject) =>
        {
            const log = slog.stepIn(LogoutApi.CLS_NAME_2, 'logout');
            const url = `/api/logout`;

            const {ok, data} = await Api.sendPostRequest(url, {});
            log.stepOut();
            Api.result(ok, data, resolve, reject);
        });
    }
}
