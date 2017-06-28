/**
 * (C) 2016-2017 printf.jp
 */
import {Request}    from 'libs/request';
import {Response}   from 'libs/response';
import AccountAgent from 'server/agents/account-agent';
import Config       from 'server/config';
import R            from 'server/libs/r';
import Utils        from 'server/libs/utils';
import Validator    from 'server/libs/validator';
import {Account}    from 'server/models/account';

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
                resetId:  ['string', null, true] as any,
                password: ['string', null, true] as any,
                confirm:  ['string', null, true] as any
            };

            if (Utils.existsParameters(param, condition) === false)
            {
                res.ext.badRequest(locale);
                break;
            }

            // 検証
            const account = await AccountAgent.findByResetId(param.resetId);
            const result =  await isResetPasswordValid(param, account, locale);

            if (result.response.status !== Response.Status.OK)
            {
                res.json(result.response);
                break;
            }

            // 更新
            account.password = Utils.getHashPassword(account.email, param.password, Config.PASSWORD_SALT);
            account.reset_id = null;
            account.two_factor_auth = null;
            await AccountAgent.update(account);

            // 送信
            const data : Response.ResetPassword =
            {
                status:  Response.Status.OK,
                message: {general:R.text(R.PASSWORD_RESET, locale)}
            };
            res.json(data);
        }
        while (false);
        log.stepOut();
    }
    catch (err) {Utils.internalServerError(err, res, log);}
}

/**
 * 検証
 */
export function isResetPasswordValid(param : Request.ResetPassword, account : Account, locale : string)
{
    return new Promise(async (resolve : (result : ValidationResult) => void, reject) =>
    {
        const log = slog.stepIn('ResetApi', 'isResetPasswordValid');
        try
        {
            const response : Response.ResetPassword = {status:Response.Status.OK, message:{}};
            const {password, confirm} = param;

            do
            {
                // アカウント存在検証
                if (account === null)
                {
                    // パスワードリセットの画面でパスワードリセットを完了させた後、再度パスワードリセットを完了させようとした場合にここに到達する想定。
                    // リセットIDで該当するアカウントがないということが必ずしもパスワードリセット済みを意味するわけではないが、
                    // 第三者が直接このAPIをコールするなど、想定以外のケースでなければありえないので、パスワードリセット済みというメッセージでOK。
                    response.status = Response.Status.FAILED;
                    response.message.general = R.text(R.ALREADY_PASSWORD_RESET, locale);
                    break;
                }

                // パスワード検証
                const passwordResult = Validator.password({password, confirm}, locale);

                if (passwordResult.status !== Response.Status.OK)
                {
                    response.status =           passwordResult.status;
                    response.message.password = passwordResult.password;
                    response.message.confirm =  passwordResult.confirm;
                }
            }
            while (false);

            if (response.status !== Response.Status.OK) {
                log.w(JSON.stringify(response, null, 2));
            }

            log.stepOut();
            resolve({response});
        }
        catch (err) {log.stepOut(); reject(err);}
    });
}

interface ValidationResult
{
    response : Response.ResetPassword;
}
