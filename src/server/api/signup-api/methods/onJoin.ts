/**
 * (C) 2016-2017 printf.jp
 */
import {Request}    from 'libs/request';
import {Response}   from 'libs/response';
import {slog}       from 'libs/slog';
import AccountAgent from 'server/agents/account-agent';
import Config       from 'server/config';
import R            from 'server/libs/r';
import Utils        from 'server/libs/utils';
import Validator    from 'server/libs/validator';
import {Account}    from 'server/models/account';

import express = require('express');

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
            const account = await AccountAgent.findByInviteId(param.inviteId);
            const result = await isJoinValid(param, account, locale);

            if (result.response.status !== Response.Status.OK)
            {
                res.json(result.response);
                break;
            }

            // 更新
            account.password =  Utils.getHashPassword(account.email, param.password, Config.PASSWORD_SALT);
            account.signup_id = null;
            account.invite_id = null;
            await AccountAgent.update(account);

            // 送信
            const data : Response.Join =
            {
                status:  Response.Status.OK,
                message: {general:R.text(R.SIGNUP_COMPLETED, locale)}
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
export async function isJoinValid(param : Request.Join, account : Account, locale : string) : Promise<ValidationResult>
{
    const log = slog.stepIn('SignupApi', 'isJoinValid');
    const response : Response.Join = {status:Response.Status.OK, message:{}};
    const {password} = param;

    do
    {
        // アカウント存在検証
        if (account === null)
        {
            // 参加画面で参加を完了させた後、再度参加を完了させようとした場合にここに到達する想定。
            // 招待IDで該当するアカウントがないということが必ずしも参加済みを意味するわけではないが、
            // 第三者が直接このAPIをコールするなど、想定以外のケースでなければありえないので、登録済みというメッセージでOK。
            response.status = Response.Status.FAILED;
            response.message.general = R.text(R.ALREADY_JOIN, locale);
            break;
        }

        // パスワード検証
        const passwordResult = Validator.password({password}, locale);

        if (passwordResult.status !== Response.Status.OK)
        {
            response.status =           passwordResult.status;
            response.message.password = passwordResult.password;
        }
    }
    while (false);

    if (response.status !== Response.Status.OK) {
        log.w(JSON.stringify(response, null, 2));
    }

    log.stepOut();
    return {response};
}

interface ValidationResult
{
    response : Response.Join;
}
