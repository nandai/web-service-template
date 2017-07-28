/**
 * (C) 2016-2017 printf.jp
 */
import * as React                     from 'react';
import * as ReactDOM                  from 'react-dom/server';

import Root                           from 'client/components/root';
import SettingsAccountEmailChangeView from 'client/components/views/settings-account-email-change-view';
import {storeNS}                      from 'client/components/views/settings-account-email-change-view/store';
import ClientR                        from 'client/libs/r';
import {slog}                         from 'libs/slog';
import AccountAgent                   from 'server/agents/account-agent';
import Utils                          from 'server/libs/utils';
import {notFound, view}               from './view';

import express = require('express');

/**
 * settings account email change app
 */
export default class SettingsAccountEmailChangeApp
{
    private static CLS_NAME = 'SettingsAccountEmailChangeApp';

    /**
     * メールアドレス変更メールのリンクから遷移してくる画面<br>
     * GET /settings/account/email/change
     *
     * @param   req httpリクエスト
     * @param   res httpレスポンス
     */
    static async index(req : express.Request, res : express.Response)
    {
        const log = slog.stepIn(SettingsAccountEmailChangeApp.CLS_NAME, 'index');
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

                const changeId : string = param.id;
                const account = await AccountAgent.findByChangeId(changeId);

                if (account === null)
                {
                    await notFound(req, res);
                    break;
                }

                const store = storeNS.init({locale});
                const title = ClientR.text(ClientR.SETTINGS_ACCOUNT_EMAIL_CHANGE, locale);
                const el = <SettingsAccountEmailChangeView store={store} />;
                const contents = ReactDOM.renderToString(<Root view={el} />);
                res.send(view(title, 'wst.js', contents, store));
            }
            while (false);
            log.stepOut();
        }
        catch (err) {Utils.internalServerError(err, res, log);}
    }
}
