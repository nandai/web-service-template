/**
 * (C) 2016-2017 printf.jp
 */
import {Request}  from 'libs/request';
import {Response} from 'libs/response';
import {slog}     from 'libs/slog';
import Api        from './api';

export default class ResetApi extends Api
{
    private static CLS_NAME_2 = '(client)ResetApi';

    /**
     * パスワードリセットの要求
     */
    static requestResetPassword(param : Request.RequestResetPassword)
    {
        return new Promise(async (resolve : (res : Response.RequestResetPassword) => void, reject) =>
        {
            const log = slog.stepIn(ResetApi.CLS_NAME_2, 'requestResetPassword');
            const url = '/api/reset';

            const {ok, data} = await Api.sendPostRequest(url, param);
            log.stepOut();
            Api.result(ok, data, resolve, reject);
        });
    }

    /**
     * パスワードリセット
     */
    static resetPassword(param : Request.ResetPassword)
    {
        return new Promise(async (resolve : (res : Response.ResetPassword) => void, reject) =>
        {
            const log = slog.stepIn(ResetApi.CLS_NAME_2, 'resetPassword');
            const url = '/api/reset/change';

            const {ok, data} = await Api.sendPutRequest(url, param);
            log.stepOut();
            Api.result(ok, data, resolve, reject);
        });
    }
}
