/**
 * (C) 2016-2017 printf.jp
 */
import * as React       from 'react';
import * as ReactDOM    from 'react-dom/server';

import ClientApp        from 'client/app/reset-app';
import Root             from 'client/components/root';
import ClientR          from 'client/libs/r';
import {slog}           from 'libs/slog';
import AccountAgent     from 'server/agents/account-agent';
import Utils            from 'server/libs/utils';
import {notFound, view} from './view';

import express = require('express');

/**
 * reset app
 */
export default class ResetApp
{
    private static CLS_NAME = 'ResetApp';

    /**
     * GET /reset
     *
     * @param   req httpリクエスト
     * @param   res httpレスポンス
     */
    static async index(req : express.Request, res : express.Response)
    {
        const log = slog.stepIn(ResetApp.CLS_NAME, 'index');
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

                const resetId : string = param.id;
                const account = await AccountAgent.findByResetId(resetId);

                if (account === null)
                {
                    await notFound(req, res);
                    break;
                }

                const title = ClientR.text(ClientR.RESET_PASSWORD, locale);
                const app = new ClientApp({locale});
                const contents = ReactDOM.renderToString(<Root app={app} />);
                res.send(view(title, 'wst.js', contents, app.store));
            }
            while (false);
            log.stepOut();
        }
        catch (err) {Utils.internalServerError(err, res, log);}
    }
}
