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
                changeId: ['string', null, true],
                password: ['string', null, true]
            };

            if (Utils.existsParameters(param, condition) === false)
            {
                res.ext.badRequest(locale);
                break;
            }

            const changeId = <string>param.changeId;
            const password = <string>param.password;

            const account = await AccountModel.findByChangeId(changeId);
            if (account)
            {
                // メールアドレス変更メールを送信してから確認までの間に同じメールアドレスが本登録される可能性があるため、
                // メールアドレスの重複チェックを行う
                const changeEmail = account.change_email;
                const alreadyExistsAccount = await AccountModel.findByProviderId('email', changeEmail);

                if (alreadyExistsAccount !== null && alreadyExistsAccount.signup_id === null)
                {
                    res.ext.error(Response.Status.FAILED, R.text(R.ALREADY_EXISTS_EMAIL, locale));
                    break;
                }

                // パスワードチェック
                const hashPassword = Utils.getHashPassword(account.email, password, Config.PASSWORD_SALT);

                if (hashPassword !== account.password)
                {
                    res.ext.error(Response.Status.FAILED, R.text(R.INVALID_PASSWORD, locale));
                    break;
                }

                // メールアドレス設定（変更）
                account.email = changeEmail;
                account.password = Utils.getHashPassword(changeEmail, password, Config.PASSWORD_SALT);
                account.change_id = null;
                account.change_email = null;
                await AccountModel.update(account);

                const data : Response.ChangeEmail =
                {
                    status:  1,
                    message: R.text(R.EMAIL_CHANGED, locale)
                };
                res.json(data);
            }
            else
            {
                // メールアドレス設定の確認画面でメールアドレスの設定を完了させた後、再度メールアドレスの設定を完了させようとした場合にここに到達する想定。
                // 変更IDで該当するアカウントがないということが必ずしもメールアドレスの設定済みを意味するわけではないが、
                // 第三者が直接このAPIをコールするなど、想定以外のケースでなければありえないので変更済みというメッセージでOK。
                res.ext.error(Response.Status.FAILED, R.text(R.ALREADY_EMAIL_CHANGED, locale));
            }
        }
        while (false);
        log.stepOut();
    }
    catch (err) {Utils.internalServerError(err, res, log);}
}