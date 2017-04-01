/**
 * (C) 2016-2017 printf.jp
 */
import R from './r';

import request = require('superagent');
const slog = window['slog'];

export default class Api
{
    private static CLS_NAME = 'Api';

    /**
     * サインアップ
     */
    static signup(sns : string, data?) : Promise<string>
    {
        return new Promise((resolve : (message : string) => void, reject) =>
        {
            const log = slog.stepIn(Api.CLS_NAME, 'signup');
            const url = `/api/signup/${sns}`;

            Api.sendPostRequest(url, data, reject, (data) =>
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
     * サインアップ確認
     */
    static confirmSignup(signupId : string, password : string) : Promise<{redirect : string, message : string}>
    {
        return new Promise((resolve : (res : {redirect : string, message : string}) => void, reject) =>
        {
            const log = slog.stepIn(Api.CLS_NAME, 'confirmSignup');
            const url = `/api/signup/email/confirm`;
            const data = {signupId, password};

            Api.sendPostRequest(url, data, reject, (data) =>
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
     * login
     */
    static login(sns : string, data?) : Promise<{smsId : string, message : string}>
    {
        return new Promise((resolve : (res : {smsId : string, message : string}) => void, reject) =>
        {
            const log = slog.stepIn(Api.CLS_NAME, 'login');
            const url = `/api/login/${sns}`;

            Api.sendPostRequest(url, data, reject, (data) =>
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
    static smsLogin(smsId : string, smsCode : string) : Promise<string>
    {
        return new Promise((resolve : (message : string) => void, reject) =>
        {
            const log = slog.stepIn(Api.CLS_NAME, 'smsLogin');
            const url = '/api/login/sms';
            const data = {smsId, smsCode};

            Api.sendPostRequest(url, data, reject, (data) =>
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
    static getAccount() : Promise<any>
    {
        return new Promise((resolve : (account) => void, reject) =>
        {
            const log = slog.stepIn(Api.CLS_NAME, 'getAccount');
            const url = `/api/settings/account`;

            Api.sendGetRequest(url, {}, reject, (data) =>
            {
                const account = data;
                log.stepOut();
                resolve(account);
            });
        });
    }

    /**
     * アカウント設定
     */
    static setAccount(name : string, phoneNo : string) : Promise<string>
    {
        return new Promise((resolve : (message : string) => void, reject) =>
        {
            const log = slog.stepIn(Api.CLS_NAME, 'setAccount');
            const url = '/api/settings/account';
            const data = {name, phoneNo};

            Api.sendPutRequest(url, data, reject, (data) =>
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
    static changeEmail(email : string) : Promise<string>
    {
        return new Promise((resolve : (message : string) => void, reject) =>
        {
            const log = slog.stepIn(Api.CLS_NAME, 'changeEmail');
            const url = '/api/settings/account/email';
            const data = {email};

            Api.sendPutRequest(url, data, reject, (data) =>
            {
                log.stepOut();
                resolve(data.message);
            });
        });
    }

    /**
     * メールアドレス変更確認
     */
    static confirmChangeEmail(changeId : string, password : string) : Promise<string>
    {
        return new Promise((resolve : (message : string) => void, reject) =>
        {
            const log = slog.stepIn(Api.CLS_NAME, 'confirmChangeEmail');
            const url = `/api/settings/account/email/change`;
            const data = {changeId, password};

            Api.sendPutRequest(url, data, reject, (data) =>
            {
                log.stepOut();
                resolve(data.message);
            });
        });
    }

    /**
     * パスワードリセットの要求
     */
    static requestResetPassword(email : string) : Promise<string>
    {
        return new Promise((resolve : (message : string) => void, reject) =>
        {
            const log = slog.stepIn(Api.CLS_NAME, 'resetPassword');
            const url = '/api/reset';
            const data = {email};

            Api.sendPostRequest(url, data, reject, (data) =>
            {
                log.stepOut();
                resolve(data.message);
            });
        });
    }

    /**
     * パスワードリセット
     */
    static resetPassword(resetId : string, password : string, confirm : string) : Promise<string>
    {
        return new Promise((resolve : (message : string) => void, reject) =>
        {
            const log = slog.stepIn(Api.CLS_NAME, 'onClickChangeButton');
            const url = '/api/reset/change';
            const data = {resetId, password, confirm};

            Api.sendPutRequest(url, data, reject, (data) =>
            {
                log.stepOut();
                resolve(data.message);
            });
        });
    }

    /**
     * パスワード変更
     */
    static changePassword(oldPassword : string, newPassword : string, confirm : string) : Promise<string>
    {
        return new Promise((resolve : (message : string) => void, reject) =>
        {
            const log = slog.stepIn(Api.CLS_NAME, 'changePassword');
            const url = '/api/settings/account/password';
            const data = {oldPassword, newPassword, confirm};

            Api.sendPutRequest(url, data, reject, (data) =>
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
