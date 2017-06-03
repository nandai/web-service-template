/**
 * (C) 2016-2017 printf.jp
 */
import {Request}    from 'libs/request';
import {Response}   from 'libs/response';
import Config       from 'server/config';
import R            from 'server/libs/r';
import Utils        from 'server/libs/utils';
import AccountModel from 'server/models/account-model';

import express = require('express');
import slog =    require('server/slog');

/**
 * パスワードをリセットする<br>
 * PUT /api/reset/change
 */
export async function onResetPassword(req : express.Request, res : express.Response)
{
    const log = slog.stepIn('ResetApi', 'onResetPassword');
    try
    {
        do
        {
            const locale = req.ext.locale;
            const param     : Request.ResetPassword = req.body;
            const condition : Request.ResetPassword =
            {
                resetId:  ['string', null, true],
                password: ['string', null, true],
                confirm:  ['string', null, true]
            };

            const resetId =  <string>param.resetId;
            const password = <string>param.password;
            const confirm =  <string>param.confirm;

            if (Utils.existsParameters(param, condition) === false)
            {
                res.ext.badRequest(locale);
                break;
            }

            if (Utils.validatePassword(password) === false)
            {
                res.ext.error(Response.Status.FAILED, R.text(R.PASSWORD_TOO_SHORT_OR_TOO_LONG, locale));
                break;
            }

            if (param.password !== confirm)
            {
                res.ext.error(Response.Status.FAILED, R.text(R.MISMATCH_PASSWORD, locale));
                break;
            }

            const account = await AccountModel.findByResetId(resetId);
            if (account)
            {
                account.password = Utils.getHashPassword(account.email, password, Config.PASSWORD_SALT);
                account.reset_id = null;
                account.two_factor_auth = null;
                await AccountModel.update(account);

                const data : Response.ResetPassword =
                {
                    status:  Response.Status.OK,
                    message: R.text(R.PASSWORD_RESET, locale)
                };
                res.json(data);
            }
            else
            {
                // パスワードリセットの画面でパスワードリセットを完了させた後、再度パスワードリセットを完了させようとした場合にここに到達する想定。
                // リセットIDで該当するアカウントがないということが必ずしもパスワードリセット済みを意味するわけではないが、
                // 第三者が直接このAPIをコールするなど、想定以外のケースでなければありえないので、パスワードリセット済みというメッセージでOK。
                res.ext.error(Response.Status.FAILED, R.text(R.ALREADY_PASSWORD_RESET, locale));
            }
        }
        while (false);
        log.stepOut();
    }
    catch (err) {Utils.internalServerError(err, res, log);}
}
