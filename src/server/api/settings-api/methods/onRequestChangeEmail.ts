/**
 * (C) 2016-2017 printf.jp
 */
import {Request}    from 'libs/request';
import {Response}   from 'libs/response';
import {slog}       from 'libs/slog';
import CommonUtils  from 'libs/utils';
import AccountAgent from 'server/agents/account-agent';
import R            from 'server/libs/r';
import Utils        from 'server/libs/utils';
import Validator    from 'server/libs/validator';
import {Account}    from 'server/models/account';
import {Session}    from 'server/models/session';

import express = require('express');

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

            // 検証
            const session : Session = req.ext.session;
            const account = await AccountAgent.find(session.account_id);
            const result =  await isRequestChangeEmailValid(param, account, locale);

            if (result.response.status !== Response.Status.OK)
            {
                res.json(result.response);
                break;
            }

            //
            let response : Response.RequestChangeEmail;

            if (account.email === changeEmail)
            {
                response =
                {
                    status:  Response.Status.OK,
                    message: {general:R.text(R.EMAIL_CHANGED, locale)}
                };
                res.json(response);
            }

            else if (changeEmail === null)
            {
                // メールアドレスを削除する場合
                account.email = null;
                account.password = null;
                await AccountAgent.update(account);

                response =
                {
                    status:  Response.Status.OK,
                    message: {general:R.text(R.PASSWORD_SETTING_CENCELED, locale)}
                };
                res.json(response);
            }

            else if (account.password === null)
            {
                // パスワードが設定されていない場合
                const template = R.mail(R.NOTICE_SET_MAIL_ADDRESS, locale);
                const resultSendMail = await Utils.sendMail(template.subject, changeEmail, template.contents);

                if (resultSendMail)
                {
                    account.email = changeEmail;
                    await AccountAgent.update(account);

                    response =
                    {
                        status:  Response.Status.OK,
                        message: {general:R.text(R.EMAIL_CHANGED, locale)}
                    };
                }
                else
                {
                    response =
                    {
                        status:  Response.Status.FAILED,
                        message: {email:R.text(R.COULD_NOT_CHANGE_EMAIL, locale)}
                    };
                }

                res.json(response);
            }

            else
            {
                // パスワードが設定されている場合
                const changeId = Utils.createRandomText(32);
                const url = Utils.generateUrl('settings/account/email/change', changeId);
                const template = R.mail(R.NOTICE_CHANGE_MAIL_ADDRESS, locale);
                const contents = CommonUtils.formatString(template.contents, {url});
                const resultSendMail = await Utils.sendMail(template.subject, changeEmail, contents);

                if (resultSendMail)
                {
                    account.change_id = changeId;
                    account.change_email = changeEmail;
                    await AccountAgent.update(account);

                    response =
                    {
                        status:  Response.Status.OK,
                        message: {general:R.text(R.CHANGE_MAIL_SENDED, locale)}
                    };
                }
                else
                {
                    response =
                    {
                        status:  Response.Status.FAILED,
                        message: {email:R.text(R.COULD_NOT_SEND_CHANGE_MAIL, locale)}
                    };
                }

                res.json(response);
            }
        }
        while (false);
        log.stepOut();
    }
    catch (err) {Utils.internalServerError(err, res, log);}
}

/**
 * 検証
 */
export function isRequestChangeEmailValid(param : Request.RequestChangeEmail, myAccount : Account, locale : string)
{
    return new Promise(async (resolve : (result : ValidationResult) => void, reject) =>
    {
        const log = slog.stepIn('SettingsApi', 'isRequestChangeEmailValid');
        try
        {
            const response : Response.RequestChangeEmail = {status:Response.Status.OK, message:{}};
            const {email} = param;

            do
            {
                if (email)
                {
                    const alreadyExistsAccount = await AccountAgent.findByProviderId('email', email);
                    const resultEmail = await Validator.email(email, myAccount.id, alreadyExistsAccount, locale);

                    if (resultEmail.status !== Response.Status.OK)
                    {
                        response.status =        resultEmail.status;
                        response.message.email = resultEmail.message;
                    }
                }
                else
                {
                    if (AccountAgent.canUnlink(myAccount, 'email') === false)
                    {
                        response.status = Response.Status.FAILED;
                        response.message.email = R.text(R.CANNOT_EMPTY_EMAIL, locale);
                    }
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
    response : Response.RequestChangeEmail;
}
