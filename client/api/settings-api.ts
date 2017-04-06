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
    static getAccount()
    {
        return new Promise((resolve : (res : Response.GetAccount) => void, reject) =>
        {
            const log = slog.stepIn(SettingsApi.CLS_NAME_2, 'getAccount');
            const url = `/api/settings/account`;

            Api.sendGetRequest(url, {}, reject, (data) =>
            {
                log.stepOut();
                resolve(data);
            });
        });
    }

    /**
     * アカウント設定
     */
    static setAccount(param : Request.SetAccount)
    {
        return new Promise((resolve : (res : Response.SetAccount) => void, reject) =>
        {
            const log = slog.stepIn(SettingsApi.CLS_NAME_2, 'setAccount');
            const url = '/api/settings/account';

            Api.sendPutRequest(url, param, reject, (data) =>
            {
                log.stepOut();
                resolve(data);
            });
        });
    }

    /**
     * アカウント削除
     */
    static deleteAccount()
    {
        return new Promise((resolve : (res : Response.DeleteAccount) => void, reject) =>
        {
            const log = slog.stepIn(SettingsApi.CLS_NAME_2, 'deleteAccount');
            const url = `/api/settings/account`;

            Api.sendDeleteRequest(url, {}, reject, (data) =>
            {
                log.stepOut();
                resolve(data);
            });
        });
    }

    /**
     * 紐付け解除
     */
    static unlinkProvider(sns : string)
    {
        return new Promise((resolve : (res : Response.UnlinkProvider) => void, reject) =>
        {
            const log = slog.stepIn(SettingsApi.CLS_NAME_2, 'unlinkProvider');
            const url = `/api/settings/account/unlink/${sns}`;

            Api.sendPutRequest(url, {}, reject, (data) =>
            {
                log.stepOut();
                resolve(data);
            });
        });
    }

    /**
     * メールアドレスの変更を要求する
     */
    static requestChangeEmail(param : Request.RequestChangeEmail)
    {
        return new Promise((resolve : (res : Response.RequestChangeEmail) => void, reject) =>
        {
            const log = slog.stepIn(SettingsApi.CLS_NAME_2, 'requestChangeEmail');
            const url = '/api/settings/account/email';

            Api.sendPutRequest(url, param, reject, (data) =>
            {
                log.stepOut();
                resolve(data);
            });
        });
    }

    /**
     * メールアドレスを変更する
     */
    static changeEmail(param : Request.ChangeEmail)
    {
        return new Promise((resolve : (res : Response.ChangeEmail) => void, reject) =>
        {
            const log = slog.stepIn(SettingsApi.CLS_NAME_2, 'changeEmail');
            const url = `/api/settings/account/email/change`;

            Api.sendPutRequest(url, param, reject, (data) =>
            {
                log.stepOut();
                resolve(data);
            });
        });
    }

    /**
     * パスワード変更
     */
    static changePassword(param : Request.ChangePassword)
    {
        return new Promise((resolve : (res : Response.ChangePassword) => void, reject) =>
        {
            const log = slog.stepIn(SettingsApi.CLS_NAME_2, 'changePassword');
            const url = '/api/settings/account/password';

            Api.sendPutRequest(url, param, reject, (data) =>
            {
                log.stepOut();
                resolve(data);
            });
        });
    }
}
