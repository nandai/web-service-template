/**
 * (C) 2016-2017 printf.jp
 */
import Api        from './api';
import {Request}  from 'libs/request';
import {Response} from 'libs/response';

const slog = window['slog'];

export default class SettingsApi extends Api
{
    private static CLS_NAME_2 = '(client)SettingsApi';

    /**
     * アカウント取得
     */
    static getAccount() : Promise<Response.Account>
    {
        return new Promise((resolve : (account : Response.Account) => void, reject) =>
        {
            const log = slog.stepIn(SettingsApi.CLS_NAME_2, 'getAccount');
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
            const log = slog.stepIn(SettingsApi.CLS_NAME_2, 'setAccount');
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
            const log = slog.stepIn(SettingsApi.CLS_NAME_2, 'deleteAccount');
            const url = `/api/settings/account`;

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
     * 紐付け解除
     */
    static unlinkProvider(sns : string) : Promise<string>
    {
        return new Promise((resolve : (message : string) => void, reject) =>
        {
            const log = slog.stepIn(SettingsApi.CLS_NAME_2, 'unlinkProvider');
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
     * メールアドレスの変更を要求する
     */
    static requestChangeEmail(param : Request.RequestChangeEmail) : Promise<string>
    {
        return new Promise((resolve : (message : string) => void, reject) =>
        {
            const log = slog.stepIn(SettingsApi.CLS_NAME_2, 'requestChangeEmail');
            const url = '/api/settings/account/email';

            Api.sendPutRequest(url, param, reject, (data) =>
            {
                log.stepOut();
                resolve(data.message);
            });
        });
    }

    /**
     * メールアドレスを変更する
     */
    static changeEmail(param : Request.ChangeEmail) : Promise<string>
    {
        return new Promise((resolve : (message : string) => void, reject) =>
        {
            const log = slog.stepIn(SettingsApi.CLS_NAME_2, 'changeEmail');
            const url = `/api/settings/account/email/change`;

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
            const log = slog.stepIn(SettingsApi.CLS_NAME_2, 'changePassword');
            const url = '/api/settings/account/password';

            Api.sendPutRequest(url, param, reject, (data) =>
            {
                log.stepOut();
                resolve(data.message);
            });
        });
    }
}
