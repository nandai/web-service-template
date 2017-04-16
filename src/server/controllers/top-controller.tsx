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
            let message : string;

            if (session.message_id)
            {
                message = R.text(session.message_id, locale);
                session.message_id = null;
                await SessionModel.update(session);
            }

            const param = req.query;
            const smsId : string = param.id;

            if (smsId)
            {
                const account = await AccountModel.findBySmsId(smsId);

                if (account)
                {
                    const store : SmsStore =
                    {
                        locale:  locale,
                        smsCode: '',
                        message: ''
                    };

                    const title = ClientR.text(ClientR.AUTH_SMS, locale);
                    const contents = ReactDOM.renderToString(<SmsView store={store} />);
                    res.send(view(title, 'wst.js', contents));
                }
                else
                {
                    notFound(res);
                }
            }
            else if (session.account_id === null || message)
            {
                log.d('ログイン画面を表示');

                const store : LoginStore =
                {
                    locale:   locale,
                    email:    '',
                    password: '',
                    message:  message
                };

                const title = ClientR.text(ClientR.LOGIN, locale);
                const contents = ReactDOM.renderToString(<LoginView store={store} />);
                res.send(view(title, 'wst.js', contents, {message}));
            }
            else
            {
                log.d('トップ画面を表示');

                const data = await SettingsApi.getAccount(req);
                const store : TopStore =
                {
                    locale:  locale,
                    account: data.account,
                    message: ''
                };

                const title = ClientR.text(ClientR.TOP, locale);
                const contents = ReactDOM.renderToString(<TopView store={store} />);
                res.send(view(title, 'wst.js', contents, store));
            }

            log.stepOut();
        }
        catch (err) {Utils.internalServerError(err, res, log)};
    }
}
