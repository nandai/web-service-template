/**
 * (C) 2016-2017 printf.jp
 */
import {Response}        from 'libs/response';
import LoginHistoryAgent from 'server/agents/login-history-agent';
import SessionAgent      from 'server/agents/session-agent';
import Authy             from 'server/libs/authy';
import {slog}            from 'server/libs/slog';
import Utils             from 'server/libs/utils';
import {LoginHistory}    from 'server/models/login-history';
import {Session}         from 'server/models/session';

import express = require('express');

/**
 * Authy OneTouchの認証ステータスをチェックする<br>
 * GET /api/login/authy/onetouch
 */
export async function onLoginAuthyOneTouch(req : express.Request, res : express.Response)
{
    const log = slog.stepIn('LoginApi', 'onLoginAuthyOneTouch');
    try
    {
        do
        {
            const locale = req.ext.locale;
            const session : Session = req.ext.session;
            let approval = false;

            if (session.authy_uuid)
            {
                approval = await Authy.checkApprovalStatus(session.authy_uuid);

                if (approval)
                {
                    // セッション更新
                    session.sms_id =     null;
                    session.sms_code =   null;
                    session.authy_uuid = null;
                    await SessionAgent.update(session);

                    // ログイン履歴作成
                    const loginHistory : LoginHistory =
                    {
                        account_id: session.account_id,
                        device:     req.headers['user-agent'] as string
                    };
                    await LoginHistoryAgent.add(loginHistory, session.id);
                }
            }

            const data : Response.LoginAuthyOneTouch = {status:Response.Status.OK, approval};
            res.json(data);
        }
        while (false);
        log.stepOut();
    }
    catch (err) {Utils.internalServerError(err, res, log);}
}
