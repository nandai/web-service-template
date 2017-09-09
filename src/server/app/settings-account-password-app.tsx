/**
 * (C) 2016-2017 printf.jp
 */
import {storeNS}        from 'client/components/views/settings-account-password-view/store';
import {slog}           from 'libs/slog';
import SettingsApi      from 'server/api/settings-api';
import Utils            from 'server/libs/utils';
import {notFound, view} from './view';

import express = require('express');

/**
 * settings account password app
 */
export default class SettingsAccountPasswordApp
{
    private static CLS_NAME = 'SettingsAccountPasswordApp';

    /**
     * 新しいパスワードを入力する画面<br>
     * GET /settings/account/password
     *
     * @param   req httpリクエスト
     * @param   res httpレスポンス
     */
    static async index(req : express.Request, res : express.Response)
    {
        const log = slog.stepIn(SettingsAccountPasswordApp.CLS_NAME, 'index');
        try
        {
            const data = await SettingsApi.getAccount(req);
            const {account} = data;
            if (account.email)
            {
                const store : storeNS.Store = {account};
                res.send(view(req, store));
            }
            else
            {
                await notFound(req, res);
            }
            log.stepOut();
        }
        catch (err) {Utils.internalServerError(err, res, log);}
    }
}
