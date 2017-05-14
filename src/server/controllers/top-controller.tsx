/**
 * (C) 2016-2017 printf.jp
 */
import * as React              from 'react';
import * as ReactDOM           from 'react-dom/server';
import {view, notFound}        from './view';
import SettingsApi             from '../api/settings-api';
import Cookie                  from '../libs/cookie';
import R                       from '../libs/r';
import Utils                   from '../libs/utils';
import SessionModel, {Session} from '../models/session-model';
import AccountModel, {Account} from '../models/account-model';
import Root                    from 'client/components/root';
import LoginView               from 'client/components/views/login-view/login-view';
import {Store as LoginStore}   from 'client/components/views/login-view/store';
import TopView                 from 'client/components/views/top-view/top-view';
import {Store as TopStore}     from 'client/components/views/top-view/store';
import SmsView                 from 'client/components/views/sms-view/sms-view';
import {Store as SmsStore}     from 'client/components/views/sms-view/store';
import ClientR                 from 'client/libs/r';

import express = require('express');
import slog =    require('../slog');

/**
 * トップコントローラ
 */
export default class TopController
{
    private static CLS_NAME = 'TopController';

    /**
     * GET /
     *
     * @param   req httpリクエスト
     * @param   res httpレスポンス
     */
    static async index(req : express.Request, res : express.Response)
    {
        const log = slog.stepIn(TopController.CLS_NAME, 'index');
        const locale = req.ext.locale;

        try
        {
            const cookie = new Cookie(req, res);
            cookie.clearPassport();

            const session : Session = req.ext.session;
            const messageId = session.message_id;
            let message : string;

            if (messageId)
            {
                message = R.text(messageId, locale);
                session.message_id = null;
                await SessionModel.update(session);
            }

            const param = req.query;
            const smsId : string = param.id;

            if (smsId)
            {
                if (session.sms_id === smsId)
                {
                    const store : SmsStore =
                    {
                        locale:  locale,
                        smsCode: '',
                        message: ''
                    };

                    const title = ClientR.text(ClientR.AUTH_SMS, locale);
                    const el = <SmsView store={store} />;
                    const contents = ReactDOM.renderToString(<Root view={el} />);
                    res.send(view(title, 'wst.js', contents));
                }
                else
                {
                    notFound(req, res);
                }
            }
            else if (session.account_id === null || session.sms_id || (messageId !== R.COULD_NOT_SEND_SMS && message))
            {
                log.d('ログイン画面を表示');

                const store : LoginStore =
                {
                    locale:   locale,
                    name:     'home',
                    email:    '',
                    password: '',
                    message:  message
                };

                const title = ClientR.text(ClientR.LOGIN, locale);
                const el = <LoginView store={store} />;
                const contents = ReactDOM.renderToString(<Root view={el} />);
                res.send(view(title, 'wst.js', contents, store));
            }
            else
            {
                log.d('トップ画面を表示');

                const data = await SettingsApi.getAccount(req);
                const store : TopStore =
                {
                    locale:  locale,
                    account: data.account,
                    message: message
                };

                const title = ClientR.text(ClientR.TOP, locale);
                const el = <TopView store={store} />;
                const contents = ReactDOM.renderToString(<Root view={el} />);
                res.send(view(title, 'wst.js', contents, store));
            }

            log.stepOut();
        }
        catch (err) {Utils.internalServerError(err, res, log)};
    }

    /**
     * GET /about
     *
     * @param   req httpリクエスト
     * @param   res httpレスポンス
     */
    static async about(req : express.Request, res : express.Response)
    {
        const log = slog.stepIn(TopController.CLS_NAME, 'index');
        const locale = req.ext.locale;

        try
        {
            const store : LoginStore =
            {
                locale:   locale,
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
        catch (err) {Utils.internalServerError(err, res, log)};
    }
}
