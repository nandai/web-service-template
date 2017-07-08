/**
 * (C) 2016-2017 printf.jp
 */
import {Request}    from 'libs/request';
import {slog}       from 'server/libs/slog';
import Utils        from 'server/libs/utils';
import {getUser}    from './getUser';

import express = require('express');

/**
 * ユーザー取得<br>
 * GET /api/user
 */
export async function onGetUser(req : express.Request, res : express.Response)
{
    const log = slog.stepIn('UserApi', 'onGetUser');
    try
    {
        do
        {
            const locale = req.ext.locale;
            const param     : Request.GetUser = req.query;
            const condition : Request.GetUser =
            {
                id: ['any', null, true] as any
            };

            if (Utils.existsParameters(param, condition) === false)
            {
                res.ext.badRequest(locale);
                break;
            }

            const data = await getUser(param, req);
            res.json(data);
        }
        while (false);
        log.stepOut();
    }
    catch (err) {Utils.internalServerError(err, res, log);}
}
