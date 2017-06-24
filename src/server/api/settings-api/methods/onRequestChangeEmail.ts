/**
 * (C) 2016-2017 printf.jp
 */
import {Request}    from 'libs/request';
import {Response}   from 'libs/response';
import CommonUtils  from 'libs/utils';
import AccountAgent from 'server/agents/account-agent';
import R            from 'server/libs/r';
import Utils        from 'server/libs/utils';
import Validator    from 'server/libs/validator';
import {Session}    from 'server/models/session';

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
                email: ['string', null, true] as any
            };

            if (Utils.existsParameters(param, condition) === false)
            {
                res.ext.badRequest(locale);
                break;
            }

            const changeEmail = param.email;

            // メールアドレスの重複チェック
            const session : Session = req.ext.session;

            if (changeEmail)
            {
                const alreadyExistsAccount = await AccountAgent.findByProviderId('email', changeEmail);
                const resultEmail = await Validator.email(changeEmail, session.account_id, alreadyExistsAccount, locale);

                if (resultEmail.status !== Response.Status.OK)
                {
                    res.ext.error(resultEmail.status, resultEmail.message);
                    break;
                }
            }

            const account = await AccountAgent.find(session.account_id);
            if (account.email === changeEmail)
            {
                const data : Response.RequestChangeEmail =
                {
                    status:  Response.Status.OK,
                    message: R.text(R.EMAIL_CHANGED, locale)
                };
                res.json(data);
                break;
            }

            if (changeEmail === null)
            {
                // メールアドレスを削除する場合
                if (AccountAgent.canUnlink(account, 'email'))
                {
                    account.email = null;
                    account.password = null;
                    await AccountAgent.update(account);

                    const data : Response.RequestChangeEmail =
                    {
                        status:  Response.Status.OK,
                        message: R.text(R.PASSWORD_SETTING_CENCELED, locale)
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
                    await AccountAgent.update(account);
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
                    await AccountAgent.update(account);
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
