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
import {Session}    from 'server/models/session';

import express = require('express');
import slog =    require('server/slog');

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

            if (Utils.existsParameters(param, condition) === false)
            {
                res.ext.badRequest(locale);
                break;
            }

            // 検証
            const session : Session = req.ext.session;
            const result = await isChangePasswordValid(param, session.account_id, locale);

            if (result.status !== Response.Status.OK)
            {
                res.ext.error(result.status, result.message);
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
                message: R.text(R.PASSWORD_CHANGED, locale)
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
export function isChangePasswordValid(param : Request.ChangePassword, myAccountId : number, locale : string)
{
    return new Promise(async (resolve : (result : ValidationResult) => void, reject) =>
    {
        const log = slog.stepIn('SettingsApi', 'isChangePasswordValid');
        try
        {
            const result : ValidationResult = {status:Response.Status.OK};
            const {oldPassword, newPassword, confirm} = param;

            do
            {
                // パスワード検証
                if (newPassword !== null)
                {
                    const passwordResult = Validator.password(newPassword, confirm, locale);

                    if (passwordResult.status !== Response.Status.OK)
                    {
                        result.status =  passwordResult.status;
                        result.message = passwordResult.message;
                        break;
                    }
                }

                // アカウント存在検証
                const account = await AccountAgent.find(myAccountId);

                if (account === null)
                {
                    result.status = Response.Status.FAILED;
                    result.message = R.text(R.ACCOUNT_NOT_FOUND, locale);
                    break;
                }

                // メールアドレスが設定されているかどうか
                if (account.email === null)
                {
                    result.status = Response.Status.FAILED;
                    result.message = R.text(R.CANNOT_SET_PASSWORD, locale);
                    break;
                }

                // パスワードを未設定にする場合は他に認証手段があるかどうか
                if (newPassword === null)
                {
                    if (AccountAgent.canUnlink(account, 'email') === false)
                    {
                        result.status = Response.Status.FAILED;
                        result.message = R.text(R.CANNOT_NO_SET_PASSWORD, locale);
                        break;
                    }
                }

                // 現在のパスワードと現在のパスワードとして入力されたパスワードが一致するかどうか
                if (account.password !== null || oldPassword !== null)
                {
                    const hashPassword = Utils.getHashPassword(account.email, oldPassword, Config.PASSWORD_SALT);

                    if (hashPassword !== account.password)
                    {
                        result.status = Response.Status.FAILED;
                        result.message = R.text(R.INVALID_PASSWORD, locale);
                        break;
                    }
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
