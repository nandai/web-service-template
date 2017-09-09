/**
 * (C) 2016-2017 printf.jp
 */
import {slog}           from 'libs/slog';
import Utils            from 'server/libs/utils';
import {Session}        from 'server/models/session';
import {notFound, view} from './view';

import express = require('express');

/**
 * sms App
 */
export default class SmsApp
{
    /**
     * GET /
     *
     * @param   req httpリクエスト
     * @param   res httpレスポンス
     */
    static async index(req : express.Request, res : express.Response)
    {
        const log = slog.stepIn('SmsApp', 'index');
        try
        {
            do
            {
                const param = req.query;
                const condition =
                {
                    id: ['string', null, true]
                };

                if (Utils.existsParameters(param, condition) === false)
                {
                    await notFound(req, res);
                    break;
                }

                const smsId : string = param.id;
                const session : Session = req.ext.session;

                if (session.sms_id !== smsId)
                {
                    await notFound(req, res);
                    break;
                }

                res.send(view(req));
            }
            while (false);
            log.stepOut();
        }
        catch (err) {Utils.internalServerError(err, res, log);}
    }
}
