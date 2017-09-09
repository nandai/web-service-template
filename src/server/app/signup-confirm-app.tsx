/**
 * (C) 2016-2017 printf.jp
 */
import {slog}           from 'libs/slog';
import AccountAgent     from 'server/agents/account-agent';
import Utils            from 'server/libs/utils';
import {notFound, view} from './view';

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

                const signupId : string = param.id;
                const account = await AccountAgent.findBySignupId(signupId);

                if (account === null)
                {
                    await notFound(req, res);
                    break;
                }

                res.send(view(req));
            }
            while (false);
            log.stepOut();
        }
        catch (err) {Utils.internalServerError(err, res, log);}
    }
}
