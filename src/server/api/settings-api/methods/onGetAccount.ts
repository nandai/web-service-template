/**
 * (C) 2016-2017 printf.jp
 */
import {slog}       from 'libs/slog';
import Utils        from 'server/libs/utils';
import {getAccount} from './getAccount';

import express = require('express');

/**
 * アカウント取得<br>
 * GET /api/settings/account
 */
export async function onGetAccount(req : express.Request, res : express.Response)
{
    const log = slog.stepIn('SettingsApi', 'onGetAccount');
    try
    {
        const data = await getAccount(req);
        res.json(data);
        log.stepOut();
    }
    catch (err) {Utils.internalServerError(err, res, log);}
}
