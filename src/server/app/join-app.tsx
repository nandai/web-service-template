/**
 * (C) 2016-2017 printf.jp
 */
import * as React       from 'react';
import * as ReactDOM    from 'react-dom/server';

import Root             from 'client/components/root';
import JoinView         from 'client/components/views/join-view';
import {Store}          from 'client/components/views/join-view/store';
import ClientR          from 'client/libs/r';
import Utils            from '../libs/utils';
import AccountModel     from '../models/account-model';
import {notFound, view} from './view';

import express = require('express');
import slog =    require('../slog');

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
                    notFound(req, res);
                    break;
                }

                const inviteId : string = param.id;
                const account = await AccountModel.findByInviteId(inviteId);

                if (account === null)
                {
                    notFound(req, res);
                    break;
                }

                const store : Store =
                {
                    locale,
                    password: '',
                    message:  ''
                };

                const title = ClientR.text(ClientR.JOIN, locale);
                const el = <JoinView store={store} />;
                const contents = ReactDOM.renderToString(<Root view={el} />);
                res.send(view(title, 'wst.js', contents));
            }
            while (false);
            log.stepOut();
        }
        catch (err) {Utils.internalServerError(err, res, log);}
    }
}
