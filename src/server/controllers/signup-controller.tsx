/**
 * (C) 2016-2017 printf.jp
 */
import * as React                    from 'react';
import * as ReactDOM                 from 'react-dom/server';
import {view, notFound}              from './view';
import R                             from '../libs/r';
import Utils                         from '../libs/utils';
import SessionModel, {Session}       from '../models/session-model';
import AccountModel, {Account}       from '../models/account-model';
import Root                          from 'client/components/root';
import JoinView                      from 'client/components/views/join-view/join-view';
import {Store as JoinStore}          from 'client/components/views/join-view/store';
import SignupView                    from 'client/components/views/signup-view/signup-view';
import {Store as SignupStore}        from 'client/components/views/signup-view/store';
import SignupConfirmView             from 'client/components/views/signup-confirm-view/signup-confirm-view';
import {Store as SignupConfirmStore} from 'client/components/views/signup-confirm-view/store';
import ClientR                       from 'client/libs/r';

import express = require('express');
import slog =    require('../slog');

/**
 * サインアップコントローラ
 */
export default class SignupController
{
    private static CLS_NAME = 'SignupController';

    /**
     * GET /signup
     *
     * @param   req httpリクエスト
     * @param   res httpレスポンス
     */
    static async index(req : express.Request, res : express.Response)
    {
        const log = slog.stepIn(SignupController.CLS_NAME, 'index');
        const locale = req.ext.locale;

        try
        {
            const param = req.query;
            const signupId = param.id;

            if (signupId === undefined)
            {
                const session : Session = req.ext.session;
                let message : string;

                if (session.message_id)
                {
                    message = R.text(session.message_id, locale);
                    session.message_id = null;
                    await SessionModel.update(session);
                }

                log.d('サインアップ画面を表示');

                const store : SignupStore =
                {
                    locale:   locale,
                    email:    '',
                    password: '',
                    message:  message
                };

                const title = ClientR.text(ClientR.SIGNUP, locale);
                const el = <SignupView store={store} />;
                const contents = ReactDOM.renderToString(<Root view={el} />);
                res.send(view(title, 'wst.js', contents, {message}));
            }
            else
            {
                const account = await AccountModel.findBySignupId(signupId);

                if (account)
                {
                    const store : SignupConfirmStore =
                    {
                        locale:   locale,
                        password: '',
                        message:  ''
                    };

                    const title = ClientR.text(ClientR.SIGNUP_CONFIRM, locale);
                    const el = <SignupConfirmView store={store} />;
                    const contents = ReactDOM.renderToString(<Root view={el} />);
                    res.send(view(title, 'wst.js', contents));
                }
                else
                {
                    notFound(req, res);
                }
            }

            log.stepOut();
        }
        catch (err) {Utils.internalServerError(err, res, log)};
    }

    /**
     * GET /join
     *
     * @param   req httpリクエスト
     * @param   res httpレスポンス
     */
    static async join(req : express.Request, res : express.Response)
    {
        const log = slog.stepIn(SignupController.CLS_NAME, 'join');
        const locale = req.ext.locale;

        try
        {
            const param = req.query;
            const inviteId = param.id;

            const account = await AccountModel.findByInviteId(inviteId);

            if (account)
            {
                const store : JoinStore =
                {
                    locale:   locale,
                    password: '',
                    message:  ''
                };

                const title = ClientR.text(ClientR.JOIN, locale);
                const el = <JoinView store={store} />;
                const contents = ReactDOM.renderToString(<Root view={el} />);
                res.send(view(title, 'wst.js', contents));
            }
            else
            {
                notFound(req, res);
            }

            log.stepOut();
        }
        catch (err) {Utils.internalServerError(err, res, log)};
    }
}
