/**
 * (C) 2016-2017 printf.jp
 */
import {storeNS}   from 'client/components/views/settings-invite-view/store';
import {slog}      from 'libs/slog';
import SettingsApi from 'server/api/settings-api';
import Utils       from 'server/libs/utils';
import {view}      from './view';

import express = require('express');

/**
 * settings invite app
 */
export default class SettingsInviteApp
{
    private static CLS_NAME = 'SettingsInviteApp';

    /**
     * 招待する画面<br>
     * GET /settings/invite
     *
     * @param   req httpリクエスト
     * @param   res httpレスポンス
     */
    static async index(req : express.Request, res : express.Response)
    {
        const log = slog.stepIn(SettingsInviteApp.CLS_NAME, 'index');
        try
        {
            const data = await SettingsApi.getAccount(req);
            const {account} = data;
            const store : storeNS.Store = {account};

            res.send(view(req, store));
            log.stepOut();
        }
        catch (err) {Utils.internalServerError(err, res, log);}
    }
}
