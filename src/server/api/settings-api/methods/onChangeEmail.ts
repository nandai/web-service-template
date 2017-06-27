/**
 * (C) 2016-2017 printf.jp
 */
import {Request}    from 'libs/request';
import {Response}   from 'libs/response';
import AccountAgent from 'server/agents/account-agent';
import Config       from 'server/config';
import R            from 'server/libs/r';
import Utils        from 'server/libs/utils';
import {Account}    from 'server/models/account';

import express = require('express');
import slog =    require('server/slog');

/**
 * メールアドレスを変更する<br>
 * PUT /api/settings/account/email/change
 */
export async function onChangeEmail(req : express.Request, res : express.Response)
{
    const log = slog.stepIn('SettingsApi', 'onChangeEmail');
    try
    {
        do
        {
            const locale = req.ext.locale;
            const param     : Request.ChangeEmail = req.body;
            const condition : Request.ChangeEmail =
            {
                changeId: ['string', null, true] as any,
                password: ['string', null, true] as any
            };

            if (Utils.existsParameters(param, condition) === false)
            {
                res.ext.badRequest(locale);
                break;
            }

            // 検証
            const account = await AccountAgent.findByChangeId(param.changeId);
            const result =  await isChangeEmailValid(param, account, locale);

            if (result.response.status !== Response.Status.OK)
            {
                res.json(result.response);
                break;
            }

            // メールアドレス設定（変更）
            account.email = account.change_email;
            account.password = Utils.getHashPassword(account.email, param.password, Config.PASSWORD_SALT);
            account.change_id = null;
            account.change_email = null;
            await AccountAgent.update(account);

            const response : Response.ChangeEmail =
            {
                status:  Response.Status.OK,
                message: {general:R.text(R.EMAIL_CHANGED, locale)}
            };
            res.json(response);
        }
        while (false);
        log.stepOut();
    }
    catch (err) {Utils.internalServerError(err, res, log);}
}

/**
 * 検証
 */
export function isChangeEmailValid(param : Request.ChangeEmail, account : Account, locale : string)
{
    return new Promise(async (resolve : (result : ValidationResult) => void, reject) =>
    {
        const log = slog.stepIn('SettingsApi', 'isChangeEmailValid');
        try
        {
            const response : Response.ChangeEmail = {status:Response.Status.OK, message:{}};
            const {password} = param;

            do
            {
                if (account)
                {
                    // メールアドレス変更メールを送信してから確認までの間に同じメールアドレスが本登録される可能性があるため、
                    // メールアドレスの重複チェックを行う
                    const changeEmail = account.change_email;
                    const alreadyExistsAccount = await AccountAgent.findByProviderId('email', changeEmail);

                    if (alreadyExistsAccount !== null && alreadyExistsAccount.signup_id === null)
                    {
                        response.status = Response.Status.FAILED;
                        response.message.general = R.text(R.ALREADY_EXISTS_EMAIL, locale);
                        break;
                    }

                    // パスワードチェック
                    const hashPassword = Utils.getHashPassword(account.email, password, Config.PASSWORD_SALT);

                    if (hashPassword !== account.password)
                    {
                        response.status = Response.Status.FAILED;
                        response.message.password = R.text(R.INVALID_PASSWORD, locale);
                    }
                }
                else
                {
                    // メールアドレス設定の確認画面でメールアドレスの設定を完了させた後、再度メールアドレスの設定を完了させようとした場合にここに到達する想定。
                    // 変更IDで該当するアカウントがないということが必ずしもメールアドレスの設定済みを意味するわけではないが、
                    // 第三者が直接このAPIをコールするなど、想定以外のケースでなければありえないので変更済みというメッセージでOK。
                    response.status = Response.Status.FAILED;
                    response.message.general = R.text(R.ALREADY_EMAIL_CHANGED, locale);
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
    response : Response.ChangeEmail;
}
