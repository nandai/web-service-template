/**
 * (C) 2016-2017 printf.jp
 */
import {Request}         from 'libs/request';
import {Response}        from 'libs/response';
import AccountAgent      from 'server/agents/account-agent';
import LoginHistoryAgent from 'server/agents/login-history-agent';
import SessionAgent      from 'server/agents/session-agent';
import Authy             from 'server/libs/authy';
import R                 from 'server/libs/r';
import {slog}            from 'server/libs/slog';
import Utils             from 'server/libs/utils';
import {LoginHistory}    from 'server/models/login-history';
import {Session}         from 'server/models/session';

import express = require('express');

/**
 * SMSに送信したログインコードでログインする<br>
 * POST /api/login/sms
 */
export async function onLoginSms(req : express.Request, res : express.Response)
{
    const log = slog.stepIn('LoginApi', 'onLoginSms');
    try
    {
        do
        {
            const locale = req.ext.locale;
            const param     : Request.LoginSms= req.body;
            const condition : Request.LoginSms =
            {
                smsId:   ['string', null, true] as any,
                smsCode: ['string', null, true] as any
            };

            if (Utils.existsParameters(param, condition) === false)
            {
                res.ext.badRequest(locale);
                break;
            }

            const {smsId, smsCode} = param;
            const session : Session = req.ext.session;

            if (session.sms_id === smsId)
            {
                const account = await AccountAgent.find(session.account_id);
                const canTwoFactorAuth = AccountAgent.canTwoFactorAuth(account);

                if (canTwoFactorAuth === false)
                {
                    res.ext.badRequest(locale);
                    break;
                }

                let success = false;
                switch (account.two_factor_auth)
                {
                    case 'SMS':
                        success = (session.sms_code === smsCode);
                        break;

                    case 'Authy':
                        success = await Authy.verify(account.authy_id, Number(smsCode));
                        break;
                }

                if (success === false)
                {
                    const response : Response.LoginSms =
                    {
                        status: Response.Status.FAILED,
                        message: {smsCode:R.text(R.MISMATCH_SMS_CODE, locale)}
                    };
                    res.json(response);
                    break;
                }

                // セッション更新
                session.sms_id =     null;
                session.sms_code =   null;
                session.authy_uuid = null;
                await SessionAgent.update(session);

                // ログイン履歴作成
                const loginHistory : LoginHistory =
                {
                    account_id: account.id,
                    device:     req.headers['user-agent'] as string
                };
                await LoginHistoryAgent.add(loginHistory);
            }

            const response : Response.LoginSms = {status:Response.Status.OK, message:{}};
            res.json(response);
        }
        while (false);
        log.stepOut();
    }
    catch (err) {Utils.internalServerError(err, res, log);}
}
