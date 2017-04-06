/**
 * (C) 2016-2017 printf.jp
 */
import Api        from './api';
import {Request}  from 'libs/request';
import {Response} from 'libs/response';

const slog = window['slog'];

export default class ResetApi extends Api
{
    private static CLS_NAME_2 = '(client)ResetApi';

    /**
     * パスワードリセットの要求
     */
    static requestResetPassword(param : Request.RequestResetPassword)
    {
        return new Promise((resolve : (res : Response.RequestResetPassword) => void, reject) =>
        {
            const log = slog.stepIn(ResetApi.CLS_NAME_2, 'requestResetPassword');
            const url = '/api/reset';

            Api.sendPostRequest(url, param, reject, (data) =>
            {
                log.stepOut();
                resolve(data);
            });
        });
    }

    /**
     * パスワードリセット
     */
    static resetPassword(param : Request.ResetPassword)
    {
        return new Promise((resolve : (res : Response.ResetPassword) => void, reject) =>
        {
            const log = slog.stepIn(ResetApi.CLS_NAME_2, 'resetPassword');
            const url = '/api/reset/change';

            Api.sendPutRequest(url, param, reject, (data) =>
            {
                log.stepOut();
                resolve(data);
            });
        });
    }
}
