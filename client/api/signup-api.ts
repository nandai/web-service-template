/**
 * (C) 2016-2017 printf.jp
 */
import Api       from './api';
import {Request} from 'libs/request';

const slog = window['slog'];

export default class SignupApi extends Api
{
    private static CLS_NAME_2 = '(client)SignupApi';

    /**
     * メールアドレスでサインアップ
     */
    static signupEmail(param : Request.SignupEmail) : Promise<string>
    {
        return new Promise((resolve : (message : string) => void, reject) =>
        {
            const log = slog.stepIn(SignupApi.CLS_NAME_2, 'signupEmail');
            const url = `/api/signup/email`;

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

    /**
     * メールアドレスのサインアップ確認
     */
    static confirmSignupEmail(param : Request.ConfirmSignupEmail) : Promise<{redirect : string, message : string}>
    {
        return new Promise((resolve : (res : {redirect : string, message : string}) => void, reject) =>
        {
            const log = slog.stepIn(SignupApi.CLS_NAME_2, 'confirmSignupEmail');
            const url = `/api/signup/email/confirm`;

            Api.sendPostRequest(url, param, reject, (data) =>
            {
                const res =
                {
                    redirect: null,
                    message:  null
                };

                if (data.status === 0) res.redirect = data.redirect;
                else                   res.message =  data.message;

                log.stepOut();
                resolve(res);
            });
        });
    }
}
