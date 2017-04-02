/**
 * (C) 2016-2017 printf.jp
 */
import R          from '../libs/r';
import {Request}  from 'libs/request';
import {Response} from 'libs/response';

import request = require('superagent');
const slog = window['slog'];

export default class Api
{
    private static CLS_NAME = 'Api';

    /**
     * メールアドレスでサインアップ
     */
    static signupEmail(param : Request.SignupEmail) : Promise<string>
    {
        return new Promise((resolve : (message : string) => void, reject) =>
        {
            const log = slog.stepIn(Api.CLS_NAME, 'signup');
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
            const log = slog.stepIn(Api.CLS_NAME, 'confirmSignup');
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

    /**
     * メールアドレスでログイン
     */
    static loginEmail(param : Request.LoginEmail) : Promise<{smsId : string, message : string}>
    {
        return new Promise((resolve : (res : {smsId : string, message : string}) => void, reject) =>
        {
            const log = slog.stepIn(Api.CLS_NAME, 'login');
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
     * ログアウト
     */
    static logout()
    {
        return new Promise((resolve : () => void, reject) =>
        {
            const log = slog.stepIn(Api.CLS_NAME, 'logout');
            const url = `/api/logout`;

            Api.sendPostRequest(url, {}, reject, (data) =>
            {
                log.stepOut();
                resolve();
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
            const log = slog.stepIn(Api.CLS_NAME, 'loginSms');
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

    /**
     * アカウント取得
     */
    static getAccount() : Promise<Response.Account>
    {
        return new Promise((resolve : (account : Response.Account) => void, reject) =>
        {
            const log = slog.stepIn(Api.CLS_NAME, 'getAccount');
            const url = `/api/settings/account`;

            Api.sendGetRequest(url, {}, reject, (data) =>
            {
                const account : Response.Account = data.account;
                log.stepOut();
                resolve(account);
            });
        });
    }

    /**
     * アカウント設定
     */
    static setAccount(param : Request.SetAccount) : Promise<string>
    {
        return new Promise((resolve : (message : string) => void, reject) =>
        {
            const log = slog.stepIn(Api.CLS_NAME, 'setAccount');
            const url = '/api/settings/account';

            Api.sendPutRequest(url, param, reject, (data) =>
            {
                log.stepOut();
                resolve(data.message);
            });
        });
    }

    /**
     * アカウント削除
     */
    static deleteAccount() : Promise<string>
    {
        return new Promise((resolve : (message : string) => void, reject) =>
        {
            const log = slog.stepIn(Api.CLS_NAME, 'deleteAccount');
            const url = `/api/settings/account/leave`;

            Api.sendDeleteRequest(url, {}, reject, (data) =>
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
     * メールアドレス変更
     */
    static changeEmail(param : Request.RequestChangeEmail) : Promise<string>
    {
        return new Promise((resolve : (message : string) => void, reject) =>
        {
            const log = slog.stepIn(Api.CLS_NAME, 'changeEmail');
            const url = '/api/settings/account/email';

            Api.sendPutRequest(url, param, reject, (data) =>
            {
                log.stepOut();
                resolve(data.message);
            });
        });
    }

    /**
     * メールアドレス変更確認
     */
    static confirmChangeEmail(param : Request.ChangeEmail) : Promise<string>
    {
        return new Promise((resolve : (message : string) => void, reject) =>
        {
            const log = slog.stepIn(Api.CLS_NAME, 'confirmChangeEmail');
            const url = `/api/settings/account/email/change`;

            Api.sendPutRequest(url, param, reject, (data) =>
            {
                log.stepOut();
                resolve(data.message);
            });
        });
    }

    /**
     * パスワードリセットの要求
     */
    static requestResetPassword(param : Request.RequestResetPassword) : Promise<string>
    {
        return new Promise((resolve : (message : string) => void, reject) =>
        {
            const log = slog.stepIn(Api.CLS_NAME, 'resetPassword');
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
            const log = slog.stepIn(Api.CLS_NAME, 'onClickChangeButton');
            const url = '/api/reset/change';

            Api.sendPutRequest(url, param, reject, (data) =>
            {
                log.stepOut();
                resolve(data.message);
            });
        });
    }

    /**
     * パスワード変更
     */
    static changePassword(param : Request.ChangePassword) : Promise<string>
    {
        return new Promise((resolve : (message : string) => void, reject) =>
        {
            const log = slog.stepIn(Api.CLS_NAME, 'changePassword');
            const url = '/api/settings/account/password';

            Api.sendPutRequest(url, param, reject, (data) =>
            {
                log.stepOut();
                resolve(data.message);
            });
        });
    }

    /**
     * 紐付け解除
     */
    static unlink(sns : string) : Promise<string>
    {
        return new Promise((resolve : (message : string) => void, reject) =>
        {
            const log = slog.stepIn(Api.CLS_NAME, 'unlink');
            const url = `/api/settings/account/unlink/${sns}`;

            Api.sendPutRequest(url, {}, reject, (data) =>
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
     * GETリクエストを送信する
     *
     * @param   url         送信先URL
     * @param   param       パラメータ
     * @param   reject      レスポンスでエラーがあった場合のコールバック
     * @param   onSuccess   レスポンスが正常だった場合のコールバック
     */
    private static sendGetRequest(
        url         : string,
        param       : Object,
        reject      : (data : {message : string}) => void,
        onSuccess   : (data) => void) : void
    {
        request
            .get(url)
            .query(param)
            .end((err, res : request.Response) =>
            {
                if (Api.rejectIfError(err, res, reject, url))
                    return;

                const data = res.body;
                onSuccess(data);
            });
    }

    /**
     * POSTリクエストを送信する
     *
     * @param   url         送信先URL
     * @param   param       パラメータ
     * @param   reject      レスポンスでエラーがあった場合のコールバック
     * @param   onSuccess   レスポンスが正常だった場合のコールバック
     * @param   onProgress  送信進捗コールバック
     */
    private static sendPostRequest(
        url         : string,
        param       : Object,
        reject      : (data : {message : string}) => void,
        onSuccess   : (data) => void,
        onProgress? : (percent : number) => void) : void
    {
        request
            .post(url)
            .on('progress', (e) =>
            {
                if (onProgress)
                    onProgress(e.percent);
            })
            .send(param)
            .end((err, res : request.Response) =>
            {
                if (Api.rejectIfError(err, res, reject, url))
                    return;

                const data = res.body;
                onSuccess(data);
            });
    }

    /**
     * PUTリクエストを送信する
     *
     * @param   url         送信先URL
     * @param   param       パラメータ
     * @param   reject      レスポンスでエラーがあった場合のコールバック
     * @param   onSuccess   レスポンスが正常だった場合のコールバック
     * @param   onProgress  送信進捗コールバック
     */
    private static sendPutRequest(
        url         : string,
        param       : Object,
        reject      : (data : {message : string}) => void,
        onSuccess   : (data) => void,
        onProgress? : (percent : number) => void) : void
    {
        request
            .put(url)
            .on('progress', (e) =>
            {
                if (onProgress)
                    onProgress(e.percent);
            })
            .send(param)
            .end((err, res : request.Response) =>
            {
                if (Api.rejectIfError(err, res, reject, url))
                    return;

                const data = res.body;
                onSuccess(data);
            });
    }

    /**
     * DELETEリクエストを送信する
     *
     * @param   url         送信先URL
     * @param   param       パラメータ
     * @param   reject      レスポンスでエラーがあった場合のコールバック
     * @param   onSuccess   レスポンスが正常だった場合のコールバック
     */
    private static sendDeleteRequest(
        url         : string,
        param       : Object,
        reject      : (data : {message : string}) => void,
        onSuccess   : (data) => void) : void
    {
        request
            .del(url)
            .query(param)
            .end((err, res : request.Response) =>
            {
                if (Api.rejectIfError(err, res, reject, url))
                    return;

                const data = res.body;
                onSuccess(data);
            });
    }

    /**
     * APIのレスポンスにエラーがあればリジェクト
     *
     * @param   err     エラー
     * @param   res     レスポンス
     * @param   reject  レスポンスでエラーがあった場合のコールバック
     * @param   url     送信先URL（デバッグ時の調査用）
     *
     * @return  エラーがあればtrueを返す
     */
    private static rejectIfError(
        err,
        res    : request.Response,
        reject : (data : {message : string}) => void,
        url    : string) : boolean
    {
        let data = {message:'Unknown error.'};
        let hasError = true;

        do
        {
            if (! res)
            {
                if (! err)
                {
                    console.error('no response data.');
                    break;
                }

                if (! err.crossDomain)
                {
                    console.error(`status:${err.status}, message:${err.message}`);
                    break;
                }

                // 未接続時は以下のエラーメッセージで、crossDomainはtrueとなっているが別にクロスドメインでエラーになっているわけではない...
                //
                // 原文：the network is offline, Origin is not allowed by Access-Control-Allow-Origin, the page is being unloaded, etc.
                // 翻訳：ネットワークがオフラインで、OriginがAccess-Control-Allow-Originによって許可されていない、ページがアンロード中など
                data.message = R.text(R.ERROR_NETWORK);
                break;
            }

            if (res.status !== 200)
            {
                data = res.body;
                break;
            }

            hasError = false;
        }
        while (false);

        if (hasError)
            reject(data);

        return hasError;
    }
}
