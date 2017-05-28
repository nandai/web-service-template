/**
 * (C) 2016-2017 printf.jp
 */
import * as React              from 'react';
import * as ReactDOM           from 'react-dom/server';

import Root                    from 'client/components/root';
import TopView                 from 'client/components/views/top-view';
import {Store}                 from 'client/components/views/top-view/store';
import ClientR                 from 'client/libs/r';
import SettingsApi             from '../api/settings-api';
import R                       from '../libs/r';
import Utils                   from '../libs/utils';
import SessionModel, {Session} from '../models/session-model';
import {view}                  from './view';

import express = require('express');
import slog =    require('../slog');

/**
 * top App
 */
export default class TopApp
{
    /**
     * GET /
     *
     * @param   req httpリクエスト
     * @param   res httpレスポンス
     */
    static async index(req : express.Request, res : express.Response)
    {
        const log = slog.stepIn('TopApp', 'index');
        const locale = req.ext.locale;

        try
        {
            const session : Session = req.ext.session;
            const messageId = session.message_id;
            let message : string;

            if (messageId)
            {
                message = R.text(messageId, locale);
                session.message_id = null;
                await SessionModel.update(session);
            }

            const data = await SettingsApi.getAccount(req);
            const store : Store =
            {
                locale,
                account: data.account,
                message
            };

            const title = ClientR.text(ClientR.TOP, locale);
            const el = <TopView store={store} />;
            const contents = ReactDOM.renderToString(<Root view={el} />);
            res.send(view(title, 'wst.js', contents, store));
            log.stepOut();
        }
        catch (err) {Utils.internalServerError(err, res, log);}
    }
}
