/**
 * (C) 2016-2017 printf.jp
 */
import * as React        from 'react';
import * as ReactDOM     from 'react-dom/server';

import Root              from 'client/components/root';
import SignupConfirmView from 'client/components/views/signup-confirm-view';
import {Store}           from 'client/components/views/signup-confirm-view/store';
import ClientR           from 'client/libs/r';
import {Response}        from 'libs/response';
import {slog}            from 'libs/slog';
import AccountAgent      from 'server/agents/account-agent';
import Utils             from 'server/libs/utils';
import {notFound, view}  from './view';

import express = require('express');

/**
 * signup confirm app
 */
export default class SignupConfirmApp
{
    private static CLS_NAME = 'SignupConfirmApp';

    /**
     * GET /signup
     *
     * @param   req httpリクエスト
     * @param   res httpレスポンス
     */
    static async index(req : express.Request, res : express.Response)
    {
        const log = slog.stepIn(SignupConfirmApp.CLS_NAME, 'index');
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

                const signupId : string = param.id;
                const account = await AccountAgent.findBySignupId(signupId);

                if (account === null)
                {
                    notFound(req, res);
                    break;
                }

                const store : Store =
                {
                    locale,
                    password: '',
                    confirmSignupEmailResponse: {status:Response.Status.OK, message:{}},
                    message:  ''
                };

                const title = ClientR.text(ClientR.SIGNUP_CONFIRM, locale);
                const el = <SignupConfirmView store={store} />;
                const contents = ReactDOM.renderToString(<Root view={el} />);
                res.send(view(title, 'wst.js', contents, store));
            }
            while (false);
            log.stepOut();
        }
        catch (err) {Utils.internalServerError(err, res, log);}
    }
}
