/**
 * (C) 2016-2017 printf.jp
 */
import * as React              from 'react';
import * as ReactDOM           from 'react-dom/server';
import {view, notFound}        from './view';
import Utils                   from '../libs/utils';
import AccountModel, {Account} from '../models/account-model';
import Root                    from 'client/components/root';
import ResetView               from 'client/components/views/reset-view/reset-view';
import {Store}                 from 'client/components/views/reset-view/store';
import ClientR                 from 'client/libs/r';

import express = require('express');
import slog =    require('../slog');

/**
 * パスワードリセットコントローラ
 */
export default class ResetController
{
    private static CLS_NAME = 'ResetController';

    /**
     * GET /reset
     *
     * @param   req httpリクエスト
     * @param   res httpレスポンス
     */
    static async index(req : express.Request, res : express.Response)
    {
        const log = slog.stepIn(ResetController.CLS_NAME, 'index');
        const locale = req.ext.locale;

        try
        {
            const param = req.query;
            const resetId : string = param.id;
            let account : Account = null;

            if (resetId)
                account = await AccountModel.findByResetId(resetId);

            if (account)
            {
                const store : Store =
                {
                    locale:   locale,
                    password: '',
                    confirm:  '',
                    message:  ''
                };

                const title = ClientR.text(ClientR.RESET_PASSWORD, locale);
                const el = <ResetView store={store} />;
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
