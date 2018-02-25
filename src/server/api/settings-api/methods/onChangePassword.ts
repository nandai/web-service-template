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
import {Session}    from 'server/models/session';

import express = require('express');

/**
 * パスワードを変更する<br>
 * PUT /api/settings/account/password
 */
export async function onChangePassword(req : express.Request, res : express.Response)
{
    const log = slog.stepIn('SettingsApi', 'onChangePassword');
    try
    {
        do
        {
            const locale = req.ext.locale;
            const param     : Request.ChangePassword = req.body;
            const condition : Request.ChangePassword =
            {
                oldPassword: ['string', null, true] as any,
                newPassword: ['string', null, true] as any,
                confirm:     ['string', null, true] as any
            };

            // log.d(JSON.stringify(param, null, 2));

            if (Utils.existsParameters(param, condition) === false)
            {
                res.ext.badRequest(locale);
                break;
            }

            // 検証
            const session : Session = req.ext.session;
            const result = await isChangePasswordValid(param, session.account_id, locale);

            if (result.response.status !== Response.Status.OK)
            {
                res.json(result.response);
                break;
            }

            // 更新
            const {account} = result;
            account.password = Utils.getHashPassword(account.email, param.newPassword, Config.PASSWORD_SALT);
            await AccountAgent.update(account);

            // 送信
            const data : Response.ChangePassword =
            {
                status:  Response.Status.OK,
                message: {general:R.text(R.PASSWORD_CHANGED, locale)}
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
export async function isChangePasswordValid(param : Request.ChangePassword, myAccountId : number, locale : string) : Promise<ValidationResult>
{
    const log = slog.stepIn('SettingsApi', 'isChangePasswordValid');
    const response : Response.ChangePassword = {status:Response.Status.OK, message:{}};
    const {oldPassword, newPassword, confirm} = param;

    let account : Account = null;

    do
    {
        // パスワード検証
        const passwordResult = Validator.password({password:newPassword, confirm, canNull:true}, locale);

        if (passwordResult.status !== Response.Status.OK)
        {
            response.status =              passwordResult.status;
            response.message.newPassword = passwordResult.password;
            response.message.confirm =     passwordResult.confirm;
        }

        // アカウント存在検証
        account = await AccountAgent.find(myAccountId);

        if (account === null)
        {
            response.status = Response.Status.FAILED;
            response.message.general = R.text(R.ACCOUNT_NOT_FOUND, locale);
            break;
        }

        // メールアドレスが設定されているかどうか
        if (account.email === null)
        {
            response.status = Response.Status.FAILED;
            response.message.general = R.text(R.CANNOT_SET_PASSWORD, locale);
        }

        // パスワードを未設定にする場合は他に認証手段があるかどうか
        if (newPassword === null)
        {
            if (AccountAgent.canUnlink(account, 'email') === false)
            {
                response.status = Response.Status.FAILED;
                response.message.newPassword = R.text(R.CANNOT_NO_SET_PASSWORD, locale);
            }
        }

        // 現在のパスワードと現在のパスワードとして入力されたパスワードが一致するかどうか
        if (account.password !== null || oldPassword !== null)
        {
            const hashPassword = Utils.getHashPassword(account.email, oldPassword, Config.PASSWORD_SALT);

            if (hashPassword !== account.password)
            {
                response.status = Response.Status.FAILED;
                response.message.oldPassword = R.text(R.INVALID_PASSWORD, locale);
            }
        }
    }
    while (false);

    if (response.status !== Response.Status.OK) {
        log.w(JSON.stringify(response, null, 2));
    }

    log.stepOut();
    return {response, account};
}

interface ValidationResult
{
    response : Response.ChangePassword;
    account? : Account;
}
