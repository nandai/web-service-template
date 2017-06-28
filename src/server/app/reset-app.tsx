/**
 * (C) 2016-2017 printf.jp
 */
import * as React              from 'react';
import * as ReactDOM           from 'react-dom/server';

import Root                    from 'client/components/root';
import ResetView               from 'client/components/views/reset-view';
import {Store}                 from 'client/components/views/reset-view/store';
import ClientR                 from 'client/libs/r';
import {Response}              from 'libs/response';
import AccountAgent            from 'server/agents/account-agent';
import Utils                   from 'server/libs/utils';
import {notFound, view}        from './view';

import express = require('express');
import slog =    require('../slog');

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
                    notFound(req, res);
                    break;
                }

                const resetId : string = param.id;
                const account = await AccountAgent.findByResetId(resetId);

                if (account === null)
                {
                    notFound(req, res);
                    break;
                }

                const store : Store =
                {
                    locale,
                    password: '',
                    confirm:  '',
                    resetPasswordResponse: {status:Response.Status.OK, message:{}},
                    message:  ''
                };

                const title = ClientR.text(ClientR.RESET_PASSWORD, locale);
                const el = <ResetView store={store} />;
                const contents = ReactDOM.renderToString(<Root view={el} />);
                res.send(view(title, 'wst.js', contents, store));
            }
            while (false);
            log.stepOut();
        }
        catch (err) {Utils.internalServerError(err, res, log);}
    }
}
