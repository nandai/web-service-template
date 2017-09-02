/**
 * (C) 2016-2017 printf.jp
 */
import ClientApp        from 'client/app/join-app';
import {slog}           from 'libs/slog';
import AccountAgent     from 'server/agents/account-agent';
import Utils            from 'server/libs/utils';
import {notFound, view} from './view';

import express = require('express');

/**
 * join app
 */
export default class JoinApp
{
    private static CLS_NAME = 'JoinApp';

    /**
     * GET /join
     *
     * @param   req httpリクエスト
     * @param   res httpレスポンス
     */
    static async index(req : express.Request, res : express.Response)
    {
        const log = slog.stepIn(JoinApp.CLS_NAME, 'index');
        const locale = req.ext.locale;

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

                const inviteId : string = param.id;
                const account = await AccountAgent.findByInviteId(inviteId);

                if (account === null)
                {
                    await notFound(req, res);
                    break;
                }

                const app = new ClientApp({locale});
                res.send(view(app));
            }
            while (false);
            log.stepOut();
        }
        catch (err) {Utils.internalServerError(err, res, log);}
    }
}
