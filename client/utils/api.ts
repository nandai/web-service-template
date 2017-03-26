/**
 * (C) 2016-2017 printf.jp
 */
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

            $.ajax({
                type: 'POST',
                url: `/api/signup/${sns}`,
                data: data
            })

            .done((data, status, jqXHR) =>
            {
                let message : string = null;
                if (data.status !== 0)
                    message = data.message;

                log.stepOut();
                resolve(message);
            })

            .fail((jqXHR, status, error) =>
            {
                log.stepOut();
                reject();
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
            const data = {signupId, password};

            $.ajax({
                type: 'POST',
                url: `/api/signup/email/confirm`,
                data: data
            })

            .done((data, status, jqXHR) =>
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
            })

            .fail((jqXHR, status, error) =>
            {
                log.stepOut();
                reject();
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

            $.ajax({
                type: 'POST',
                url: `/api/login/${sns}`,
                data: data
            })

            .done((data, status, jqXHR) =>
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
            })

            .fail((jqXHR, status, error) =>
            {
                log.stepOut();
                reject();
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

            $.ajax({
                type: 'POST',
                url: `/api/logout`
            })

            .done((data, status, jqXHR) =>
            {
                log.stepOut();
                resolve();
            })

            .fail((jqXHR, status, error) =>
            {
                log.stepOut();
                reject();
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

            $.ajax({
                type: 'POST',
                url: '/api/login/sms',
                data: {smsId, smsCode}
            })

            .done((data, status, jqXHR) =>
            {
                let message : string = null;
                if (data.status !== 0)
                    message = data.message;

                log.stepOut();
                resolve(message);
            })

            .fail((jqXHR, status, error) =>
            {
                log.stepOut();
                reject();
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

            $.ajax({
                type: 'GET',
                url: `/api/settings/account`
            })

            .done((data, status, jqXHR) =>
            {
                const account = data;
                log.stepOut();
                resolve(account);
            })

            .fail((jqXHR, status, error) =>
            {
                log.stepOut();
                reject();
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

            $.ajax({
                type: 'PUT',
                url: '/api/settings/account',
                data: {name, phoneNo}
            })

            .done((data, status, jqXHR) =>
            {
                log.stepOut();
                resolve(data.message);
            })

            .fail((jqXHR, status, error) =>
            {
                log.stepOut();
                reject();
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

            $.ajax({
                type: 'DELETE',
                url: `/api/settings/account/leave`
            })

            .done((data, status, jqXHR) =>
            {
                let message : string = null;
                if (data.status !== 0)
                    message = data.message;

                log.stepOut();
                resolve(message);
            })

            .fail((jqXHR, status, error) =>
            {
                log.stepOut();
                reject();
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

            $.ajax({
                type: 'PUT',
                url: '/api/settings/account/email',
                data: {email}
            })

            .done((data, status, jqXHR) =>
            {
                log.stepOut();
                resolve(data.message);
            })

            .fail((jqXHR, status, error) =>
            {
                log.stepOut();
                reject();
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
            const data = {changeId, password};

            $.ajax({
                type: 'PUT',
                url: `/api/settings/account/email/change`,
                data: data
            })

            .done((data, status, jqXHR) =>
            {
                log.stepOut();
                resolve(data.message);
            })

            .fail((jqXHR, status, error) =>
            {
                log.stepOut();
                reject();
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

            $.ajax({
                type: 'POST',
                url: '/api/reset',
                data: {email}
            })

            .done((data, status, jqXHR) =>
            {
                log.stepOut();
                resolve(data.message);
            })

            .fail((jqXHR, status, error) =>
            {
                log.stepOut();
                reject();
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

            $.ajax({
                type: 'PUT',
                url: '/api/reset/change',
                data: {resetId, password, confirm}
            })

            .done((data, status, jqXHR) =>
            {
                log.stepOut();
                resolve(data.message);
            })

            .fail((jqXHR, status, error) =>
            {
                log.stepOut();
                reject();
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

            $.ajax({
                type: 'PUT',
                url: '/api/settings/account/password',
                data: {oldPassword, newPassword, confirm}
            })

            .done((data, status, jqXHR) =>
            {
                log.stepOut();
                resolve(data.message);
            })

            .fail((jqXHR, status, error) =>
            {
                log.stepOut();
                reject();
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

            $.ajax({
                type: 'PUT',
                url: `/api/settings/account/unlink/${sns}`
            })

            .done((data, status, jqXHR) =>
            {
                let message : string = null;
                if (data.status !== 0)
                    message = data.message;

                log.stepOut();
                resolve(message);
            })

            .fail((jqXHR, status, error) =>
            {
                log.stepOut();
                reject();
            });
        });
    }
}
