/**
 * (C) 2016-2017 printf.jp
 */
import Api       from './api';
import {Request} from 'libs/request';

const slog = window['slog'];

export default class LoginApi extends Api
{
    private static CLS_NAME_2 = '(client)LoginApi';

    /**
     * メールアドレスでログイン
     */
    static loginEmail(param : Request.LoginEmail) : Promise<{smsId : string, message : string}>
    {
        return new Promise((resolve : (res : {smsId : string, message : string}) => void, reject) =>
        {
            const log = slog.stepIn(LoginApi.CLS_NAME_2, 'loginEmail');
            const url = `/api/login/email`;

            Api.sendPostRequest(url, param, reject, (data) =>
            {
                const res =
                {
                    smsId:   null,
                    message: null
                };

                if (data.status === 0) res.smsId =   data.smsId;
                else                   res.message = data.message;

                log.stepOut();
                resolve(res);
            });
        });
    }

    /**
     * SMSログイン
     */
    static loginSms(param : Request.LoginSms) : Promise<string>
    {
        return new Promise((resolve : (message : string) => void, reject) =>
        {
            const log = slog.stepIn(LoginApi.CLS_NAME_2, 'loginSms');
            const url = '/api/login/sms';

            Api.sendPostRequest(url, param, reject, (data) =>
            {
                let message : string = null;
                if (data.status !== 0)
                    message = data.message;

                log.stepOut();
                resolve(message);
            });
        });
    }
}
