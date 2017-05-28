/**
 * (C) 2016-2017 printf.jp
 */
import * as React              from 'react';
import * as ReactDOM           from 'react-dom/server';

import Root                    from 'client/components/root';
import LoginView               from 'client/components/views/login-view';
import {Store}                 from 'client/components/views/login-view/store';
import ClientR                 from 'client/libs/r';
import SmsApp                  from '../app/sms-app';
import TopApp                  from '../app/top-app';
import Cookie                  from '../libs/cookie';
import R                       from '../libs/r';
import Utils                   from '../libs/utils';
import SessionModel, {Session} from '../models/session-model';
import {notFound, view}        from './view';

import express = require('express');
import slog =    require('../slog');

/**
 * top App
 */
export default class LoginApp
{
    private static CLS_NAME = 'LoginApp';

    /**
     * GET /
     *
     * @param   req httpリクエスト
     * @param   res httpレスポンス
     */
    static async index(req : express.Request, res : express.Response)
    {
        if (Object.keys(req.query).length > 0)
        {
            SmsApp.index(req, res);
            return;
        }

        const session : Session = req.ext.session;
        if (session.account_id && session.sms_id === null)
        {
            TopApp.index(req, res);
            return;
        }

        const log = slog.stepIn(LoginApp.CLS_NAME, 'index');
        const locale = req.ext.locale;

        try
        {
            const cookie = new Cookie(req, res);
            cookie.clearPassport();

            const messageId = session.message_id;
            let message : string;

            if (messageId)
            {
                message = R.text(messageId, locale);
                session.message_id = null;
                await SessionModel.update(session);
            }

            const store : Store =
            {
                locale,
                name:     'home',
                email:    '',
                password: '',
                message
            };

            const title = ClientR.text(ClientR.LOGIN, locale);
            const el = <LoginView store={store} />;
            const contents = ReactDOM.renderToString(<Root view={el} />);
            res.send(view(title, 'wst.js', contents, store));
            log.stepOut();
        }
        catch (err) {Utils.internalServerError(err, res, log);}
    }

    /**
     * GET /about
     *
     * @param   req httpリクエスト
     * @param   res httpレスポンス
     */
    static async about(req : express.Request, res : express.Response)
    {
        const log = slog.stepIn(LoginApp.CLS_NAME, 'index');
        const locale = req.ext.locale;

        try
        {
            const store : Store =
            {
                locale,
                name:     'about',
                email:    '',
                password: '',
                message:  ''
            };

            const title = ClientR.text(ClientR.ABOUT, locale);
            const el = <LoginView store={store} />;
            const contents = ReactDOM.renderToString(<Root view={el} />);
            res.send(view(title, 'wst.js', contents, store));
            log.stepOut();
        }
        catch (err) {Utils.internalServerError(err, res, log);}
    }
}