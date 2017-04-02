/**
 * (C) 2016-2017 printf.jp
 */
import Api       from './api';
import {Request} from 'libs/request';

const slog = window['slog'];

export default class ResetApi extends Api
{
    private static CLS_NAME_2 = '(client)ResetApi';

    /**
     * パスワードリセットの要求
     */
    static requestResetPassword(param : Request.RequestResetPassword) : Promise<string>
    {
        return new Promise((resolve : (message : string) => void, reject) =>
        {
            const log = slog.stepIn(ResetApi.CLS_NAME_2, 'requestResetPassword');
            const url = '/api/reset';

            Api.sendPostRequest(url, param, reject, (data) =>
            {
                log.stepOut();
                resolve(data.message);
            });
        });
    }

    /**
     * パスワードリセット
     */
    static resetPassword(param : Request.ResetPassword) : Promise<string>
    {
        return new Promise((resolve : (message : string) => void, reject) =>
        {
            const log = slog.stepIn(ResetApi.CLS_NAME_2, 'resetPassword');
            const url = '/api/reset/change';

            Api.sendPutRequest(url, param, reject, (data) =>
            {
                log.stepOut();
                resolve(data.message);
            });
        });
    }
}
