/**
 * (C) 2016-2017 printf.jp
 */
import {Request}    from 'libs/request';
import {Response}   from 'libs/response';
import CommonUtils  from 'libs/utils';
import R            from 'server/libs/r';
import Utils        from 'server/libs/utils';
import AccountModel from 'server/models/account-model';
import {Session}    from 'server/models/session-model';

import express = require('express');
import slog =    require('server/slog');

/**
 * メールアドレスの変更を要求する<br>
 * PUT /api/settings/account/email
 */
export async function onRequestChangeEmail(req : express.Request, res : express.Response)
{
    const log = slog.stepIn('SettingsApi', 'onRequestChangeEmail');
    try
    {
        do
        {
            const locale = req.ext.locale;
            const param     : Request.RequestChangeEmail = req.body;
            const condition : Request.RequestChangeEmail =
            {
                email: ['string', null, true]
            };

            if (Utils.existsParameters(param, condition) === false)
            {
                res.ext.badRequest(locale);
                break;
            }

            const changeEmail = <string>param.email;

            // メールアドレスの重複チェック
            const alreadyExistsAccount = await AccountModel.findByProviderId('email', changeEmail);

//          if (alreadyExistsAccount !== null && alreadyExistsAccount.signup_id === null)
            if (alreadyExistsAccount !== null)
            {
                res.ext.error(Response.Status.FAILED, R.text(R.ALREADY_EXISTS_EMAIL, locale));
                break;
            }

            // パスワードがなければメールアドレスを設定し、あれば変更メールを送信する
            const session : Session = req.ext.session;
            const account = await AccountModel.find(session.account_id);

            if (changeEmail === null || changeEmail === '')
            {
                // メールアドレスを削除する場合
                if (account.canUnlink('email'))
                {
                    account.email = null;
                    account.password = null;
                    await AccountModel.update(account);

                    const data : Response.RequestChangeEmail =
                    {
                        status:  Response.Status.OK,
                        message: R.text(R.EMAIL_CHANGED, locale)
                    };
                    res.json(data);
                }
                else
                {
                    res.ext.error(Response.Status.FAILED, R.text(R.CANNOT_EMPTY_EMAIL, locale));
                }
            }

            else if (account.password === null)
            {
                // パスワードが設定されていない場合
                const template = R.mail(R.NOTICE_SET_MAIL_ADDRESS, locale);
                const result = await Utils.sendMail(template.subject, changeEmail, template.contents);

                if (result)
                {
                    account.email = changeEmail;
                    await AccountModel.update(account);
                }

                const data : Response.RequestChangeEmail =
                    Utils.createMessageResponse(result, R.EMAIL_CHANGED, R.COULD_NOT_CHANGE_EMAIL, locale);
                res.json(data);
            }

            else
            {
                // パスワードが設定されている場合
                const changeId = Utils.createRandomText(32);
                const url = Utils.generateUrl('settings/account/email/change', changeId);
                const template = R.mail(R.NOTICE_CHANGE_MAIL_ADDRESS, locale);
                const contents = CommonUtils.formatString(template.contents, {url});
                const result = await Utils.sendMail(template.subject, changeEmail, contents);

                if (result)
                {
                    account.change_id = changeId;
                    account.change_email = changeEmail;
                    await AccountModel.update(account);
                }

                const data : Response.RequestChangeEmail =
                    Utils.createMessageResponse(result, R.CHANGE_MAIL_SENDED, R.COULD_NOT_SEND_CHANGE_MAIL, locale);
                res.json(data);
            }
        }
        while (false);
        log.stepOut();
    }
    catch (err) {Utils.internalServerError(err, res, log);}
}
