/**
 * (C) 2016-2017 printf.jp
 */
import Api        from './api';
import {Request}  from 'libs/request';
import {Response} from 'libs/response';

const slog = window['slog'];

export default class LoginApi extends Api
{
    private static CLS_NAME_2 = '(client)LoginApi';

    /**
     * メールアドレスでログイン
     */
    static loginEmail(param : Request.LoginEmail)
    {
        return new Promise((resolve : (res : Response.LoginEmail) => void, reject) =>
        {
            const log = slog.stepIn(LoginApi.CLS_NAME_2, 'loginEmail');
            const url = `/api/login/email`;

            Api.sendPostRequest(url, param, reject, (data) =>
            {
                log.stepOut();
                resolve(data);
            });
        });
    }

    /**
     * SMSログイン
     */
    static loginSms(param : Request.LoginSms)
    {
        return new Promise((resolve : (res : Response.LoginSms) => void, reject) =>
        {
            const log = slog.stepIn(LoginApi.CLS_NAME_2, 'loginSms');
            const url = '/api/login/sms';

            Api.sendPostRequest(url, param, reject, (data) =>
            {
                log.stepOut();
                resolve(data);
            });
        });
    }
}
