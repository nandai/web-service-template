/**
 * (C) 2016-2017 printf.jp
 */
import Api        from './api';
import {Request}  from 'libs/request';
import {Response} from 'libs/response';

const slog = window['slog'];

export default class SignupApi extends Api
{
    private static CLS_NAME_2 = '(client)SignupApi';

    /**
     * メールアドレスでサインアップ
     */
    static signupEmail(param : Request.SignupEmail)
    {
        return new Promise(async (resolve : (res : Response.SignupEmail) => void, reject) =>
        {
            const log = slog.stepIn(SignupApi.CLS_NAME_2, 'signupEmail');
            const url = `/api/signup/email`;

            const {ok, data} = await Api.sendPostRequest(url, param);
            log.stepOut();
            Api.result(ok, data, resolve, reject);
        });
    }

    /**
     * メールアドレスのサインアップ確認
     */
    static confirmSignupEmail(param : Request.ConfirmSignupEmail)
    {
        return new Promise(async (resolve : (res : Response.ConfirmSignupEmail) => void, reject) =>
        {
            const log = slog.stepIn(SignupApi.CLS_NAME_2, 'confirmSignupEmail');
            const url = `/api/signup/email/confirm`;

            const {ok, data} = await Api.sendPostRequest(url, param);
            log.stepOut();
            Api.result(ok, data, resolve, reject);
        });
    }
}