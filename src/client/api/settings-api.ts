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
        return new Promise(async (resolve : (res : Response.GetAccount) => void, reject) =>
        {
            const log = slog.stepIn(SettingsApi.CLS_NAME_2, 'getAccount');
            const url = `/api/settings/account`;

            const {ok, data} = await Api.sendGetRequest(url, {});
            log.stepOut();
            Api.result(ok, data, resolve, reject);
        });
    }

    /**
     * アカウント設定
     */
    static setAccount(param : Request.SetAccount)
    {
        return new Promise(async (resolve : (res : Response.SetAccount) => void, reject) =>
        {
            const log = slog.stepIn(SettingsApi.CLS_NAME_2, 'setAccount');
            const url = '/api/settings/account';

            const {ok, data} = await Api.sendPutRequest(url, param);
            log.stepOut();
            Api.result(ok, data, resolve, reject);
        });
    }

    /**
     * アカウント削除
     */
    static deleteAccount()
    {
        return new Promise(async (resolve : (res : Response.DeleteAccount) => void, reject) =>
        {
            const log = slog.stepIn(SettingsApi.CLS_NAME_2, 'deleteAccount');
            const url = `/api/settings/account`;

            const {ok, data} = await Api.sendDeleteRequest(url, {});
            log.stepOut();
            Api.result(ok, data, resolve, reject);
        });
    }

    /**
     * 紐付け解除
     */
    static unlinkProvider(param : Request.UnlinkProvider)
    {
        return new Promise(async (resolve : (res : Response.UnlinkProvider) => void, reject) =>
        {
            const log = slog.stepIn(SettingsApi.CLS_NAME_2, 'unlinkProvider');
            const url = `/api/settings/account/unlink`;

            const {ok, data} = await Api.sendPutRequest(url, param);
            log.stepOut();
            Api.result(ok, data, resolve, reject);
        });
    }

    /**
     * メールアドレスの変更を要求する
     */
    static requestChangeEmail(param : Request.RequestChangeEmail)
    {
        return new Promise(async (resolve : (res : Response.RequestChangeEmail) => void, reject) =>
        {
            const log = slog.stepIn(SettingsApi.CLS_NAME_2, 'requestChangeEmail');
            const url = '/api/settings/account/email';

            const {ok, data} = await Api.sendPutRequest(url, param);
            log.stepOut();
            Api.result(ok, data, resolve, reject);
        });
    }

    /**
     * メールアドレスを変更する
     */
    static changeEmail(param : Request.ChangeEmail)
    {
        return new Promise(async (resolve : (res : Response.ChangeEmail) => void, reject) =>
        {
            const log = slog.stepIn(SettingsApi.CLS_NAME_2, 'changeEmail');
            const url = `/api/settings/account/email/change`;

            const {ok, data} = await Api.sendPutRequest(url, param);
            log.stepOut();
            Api.result(ok, data, resolve, reject);
        });
    }

    /**
     * パスワード変更
     */
    static changePassword(param : Request.ChangePassword)
    {
        return new Promise(async (resolve : (res : Response.ChangePassword) => void, reject) =>
        {
            const log = slog.stepIn(SettingsApi.CLS_NAME_2, 'changePassword');
            const url = '/api/settings/account/password';

            const {ok, data} = await Api.sendPutRequest(url, param);
            log.stepOut();
            Api.result(ok, data, resolve, reject);
        });
    }

    /**
     * 招待する
     */
    static invite(param : Request.Invite)
    {
        return new Promise(async (resolve : (res : Response.Invite) => void, reject) =>
        {
            const log = slog.stepIn(SettingsApi.CLS_NAME_2, 'invite');
            const url = '/api/settings/invite';

            const {ok, data} = await Api.sendPostRequest(url, param);
            log.stepOut();
            Api.result(ok, data, resolve, reject);
        });
    }
}
