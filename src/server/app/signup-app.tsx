/**
 * (C) 2016-2017 printf.jp
 */
import * as React              from 'react';
import * as ReactDOM           from 'react-dom/server';

import Root                    from 'client/components/root';
import SignupView              from 'client/components/views/signup-view';
import {Store}                 from 'client/components/views/signup-view/store';
import ClientR                 from 'client/libs/r';
import SignupConfirmApp        from '../app/signup-confirm-app';
import R                       from '../libs/r';
import Utils                   from '../libs/utils';
import SessionModel, {Session} from '../models/session-model';
import {view}                  from './view';

import express = require('express');
import slog =    require('../slog');

/**
 * signup app
 */
export default class SignupApp
{
    private static CLS_NAME = 'SignupApp';

    /**
     * GET /signup
     *
     * @param   req httpリクエスト
     * @param   res httpレスポンス
     */
    static async index(req : express.Request, res : express.Response)
    {
        if (Object.keys(req.query).length > 0)
        {
            SignupConfirmApp.index(req, res);
            return;
        }

        const log = slog.stepIn(SignupApp.CLS_NAME, 'index');
        const locale = req.ext.locale;

        try
        {
            const session : Session = req.ext.session;
            let message   : string;

            if (session.message_id)
            {
                message = R.text(session.message_id, locale);
                session.message_id = null;
                await SessionModel.update(session);
            }

            const store : Store =
            {
                locale,
                email:    '',
                password: '',
                message
            };

            const title = ClientR.text(ClientR.SIGNUP, locale);
            const el = <SignupView store={store} />;
            const contents = ReactDOM.renderToString(<Root view={el} />);
            res.send(view(title, 'wst.js', contents, {message}));
            log.stepOut();
        }
        catch (err) {Utils.internalServerError(err, res, log);}
    }
}