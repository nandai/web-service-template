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
 * 参加する<br>
 * POST /api/join
 */
export async function onJoin(req : express.Request, res : express.Response)
{
    const log = slog.stepIn('SignupApi', 'onJoin');
    try
    {
        do
        {
            const locale = req.ext.locale;
            const param     : Request.Join = req.body;
            const condition : Request.Join =
            {
                inviteId: ['string', null, true] as any,
                password: ['string', null, true] as any
            };

            if (Utils.existsParameters(param, condition) === false)
            {
                res.ext.badRequest(locale);
                break;
            }

            // 検証
            const result = await isJoinValid(param, locale);

            if (result.status !== Response.Status.OK)
            {
                res.ext.error(result.status, result.message);
                break;
            }

            // 更新
            const {account} = result;
            account.password =  Utils.getHashPassword(account.email, param.password, Config.PASSWORD_SALT);
            account.signup_id = null;
            account.invite_id = null;
            await AccountAgent.update(account);

            // 送信
            const data : Response.Join =
            {
                status:  Response.Status.OK,
                message: R.text(R.SIGNUP_COMPLETED, locale)
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
export function isJoinValid(param : Request.Join, locale : string)
{
    return new Promise(async (resolve : (result : ValidationResult) => void, reject) =>
    {
        const log = slog.stepIn('SignupApi', 'isJoinValid');
        try
        {
            const result : ValidationResult = {status:Response.Status.OK};
            const {inviteId, password} = param;

            do
            {
                // パスワード検証
                const passwordResult = Validator.password({password}, locale);

                if (passwordResult.status !== Response.Status.OK)
                {
                    result.status =  passwordResult.status;
                    result.message = passwordResult.password;
                    break;
                }

                // アカウント存在検証
                const account = await AccountAgent.findByInviteId(inviteId);

                if (account === null)
                {
                    // 参加画面で参加を完了させた後、再度参加を完了させようとした場合にここに到達する想定。
                    // 招待IDで該当するアカウントがないということが必ずしも参加済みを意味するわけではないが、
                    // 第三者が直接このAPIをコールするなど、想定以外のケースでなければありえないので、登録済みというメッセージでOK。
                    result.status = Response.Status.FAILED;
                    result.message = R.text(R.ALREADY_JOIN, locale);
                    break;
                }

                result.account = account;
            }
            while (false);

            if (result.status !== Response.Status.OK) {
                log.w(JSON.stringify(result, null, 2));
            }

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
