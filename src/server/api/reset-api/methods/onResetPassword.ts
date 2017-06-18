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

            const {resetId, password, confirm} = param;

            // 検証
            const result = await isResetPasswordValid(resetId, password, confirm, locale);

            if (result.status !== Response.Status.OK)
            {
                res.ext.error(result.status, result.message);
                break;
            }

            // 更新
            const {account} = result;
            account.password = Utils.getHashPassword(account.email, password, Config.PASSWORD_SALT);
            account.reset_id = null;
            account.two_factor_auth = null;
            await AccountAgent.update(account);

            const data : Response.ResetPassword =
            {
                status:  Response.Status.OK,
                message: R.text(R.PASSWORD_RESET, locale)
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
export function isResetPasswordValid(resetId : string, password : string, confirm : string, locale : string)
{
    return new Promise(async (resolve : (result : ValidationResult) => void, reject) =>
    {
        const log = slog.stepIn('ResetApi', 'isResetPasswordValid');
        try
        {
            const result : ValidationResult = {status:Response.Status.OK};

            do
            {
                // パスワード検証
                const passwordResult = Validator.password(password, locale);

                if (passwordResult.status !== Response.Status.OK)
                {
                    result.status =  passwordResult.status;
                    result.message = passwordResult.message;
                    break;
                }

                // パスワード確認検証
                if (password !== confirm)
                {
                    result.status = Response.Status.FAILED;
                    result.message = R.text(R.MISMATCH_PASSWORD, locale);
                    break;
                }

                // アカウント存在検証
                const account = await AccountAgent.findByResetId(resetId);
                if (account === null)
                {
                    // パスワードリセットの画面でパスワードリセットを完了させた後、再度パスワードリセットを完了させようとした場合にここに到達する想定。
                    // リセットIDで該当するアカウントがないということが必ずしもパスワードリセット済みを意味するわけではないが、
                    // 第三者が直接このAPIをコールするなど、想定以外のケースでなければありえないので、パスワードリセット済みというメッセージでOK。
                    result.status = Response.Status.FAILED;
                    result.message = R.text(R.ALREADY_PASSWORD_RESET, locale);
                    break;
                }
                result.account = account;
            }
            while (false);

            log.d(JSON.stringify(result, null, 2));
            log.stepOut();
            resolve(result);
        }
        catch (err) {log.stepOut(); reject(err);}
    });
}

interface ValidationResult
{
    status   : Response.Status;
    message? : string;
    account? : Account;
}
