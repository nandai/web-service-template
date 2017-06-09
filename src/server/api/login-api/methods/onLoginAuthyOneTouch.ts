/**
 * (C) 2016-2017 printf.jp
 */
import {Response}                        from 'libs/response';
import Authy                             from 'server/libs/authy';
import Utils                             from 'server/libs/utils';
import LoginHistoryModel, {LoginHistory} from 'server/models/login-history-model';
import SessionModel, {Session}           from 'server/models/session-model';

import express = require('express');
import slog =    require('server/slog');

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
                    await SessionModel.update(session);

                    // ログイン履歴作成
                    const loginHistory : LoginHistory =
                    {
                        account_id: session.account_id,
                        device:     req.headers['user-agent']
                    };
                    await LoginHistoryModel.add(loginHistory);
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
