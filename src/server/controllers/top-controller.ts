/**
 * (C) 2016-2017 printf.jp
 */
import {view, notFound}        from './view';
import Cookie                  from '../libs/cookie';
import R                       from '../libs/r';
import Utils                   from '../libs/utils';
import SessionModel, {Session} from '../models/session-model';
import AccountModel, {Account} from '../models/account-model';
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
            let message;

            if (session.message_id)
            {
                message = R.text(session.message_id, locale);
                session.message_id = null;
                await SessionModel.update(session);
            }

            const param = req.query;
            const smsId = param.id;

            if (smsId)
            {
                const account = await AccountModel.findBySmsId(smsId);

                if (account)
                {
                    const title = ClientR.text(ClientR.AUTH_SMS, locale);
                    res.send(view(title, 'sms.js', smsId));
                }
                else
                {
                    notFound(res);
                }
            }
            else if (session.account_id === null || message)
            {
                log.d('ログイン画面を表示');
                const title = ClientR.text(ClientR.LOGIN, locale);
                res.send(view(title, 'wst.js', message));
            }
            else
            {
                log.d('トップ画面を表示');
                const title = ClientR.text(ClientR.TOP, locale);
                res.send(view(title, 'index.js'));
            }

            log.stepOut();
        }
        catch (err) {Utils.internalServerError(err, res, log)};
    }
}
