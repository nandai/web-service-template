/**
 * (C) 2016-2017 printf.jp
 */
import Config                  from '../config';
import R                       from '../libs/r';
import Utils                   from '../libs/utils';
import AccountModel, {Account} from '../models/account-model';
import {Request}               from 'libs/request';
import {Response}              from 'libs/response';

import express = require('express');
import slog =    require('../slog');

/**
 * リセットAPI
 */
export default class ResetApi
{
    private static CLS_NAME = 'ResetApi';

    /**
     * パスワードのリセットを要求する<br>
     * POST /api/reset
     */
    static async onRequestResetPassword(req : express.Request, res : express.Response)
    {
        const log = slog.stepIn(ResetApi.CLS_NAME, 'onRequestResetPassword');
        try
        {
            do
            {
                const locale = req.ext.locale;
                const param     : Request.RequestResetPassword = req.body;
                const condition : Request.RequestResetPassword =
                {
                    email: ['string', null, true]
                }

                if (Utils.existsParameters(param, condition) === false)
                {
                    res.ext.badRequest(locale);
                    break;
                }

                const email = <string>param.email;

                const account = await AccountModel.findByProviderId('email', email);
                if (account === null || account.signup_id)
                {
                    res.ext.error(Response.Status.FAILED, R.text(R.INVALID_EMAIL, locale));
                    break;
                }

                account.reset_id = Utils.createRandomText(32);
                await AccountModel.update(account);

                const url = Utils.generateUrl('reset', account.reset_id);
                const template = R.mail(R.NOTICE_RESET_PASSWORD, locale);
                const contents = Utils.formatString(template.contents, {url});
                const result = await Utils.sendMail(template.subject, account.email, contents);

                const data : Response.RequestResetPassword =
                {
                    status:  1,
                    message: R.text(result ? R.RESET_MAIL_SENDED : R.COULD_NOT_SEND_RESET_MAIL, locale)
                };
                res.json(data);
            }
            while (false);
            log.stepOut();
        }
        catch (err) {Utils.internalServerError(err, res, log)};
    }

    /**
     * パスワードをリセットする<br>
     * PUT /api/reset/change
     */
    static async onResetPassword(req : express.Request, res : express.Response)
    {
        const log = slog.stepIn(ResetApi.CLS_NAME, 'onResetPassword');
        try
        {
            do
            {
                const locale = req.ext.locale;
                const param     : Request.ResetPassword = req.body;
                const condition : Request.ResetPassword =
                {
                    resetId:  ['string', null, true],
                    password: ['string', null, true],
                    confirm:  ['string', null, true]
                }

                const resetId =  <string>param.resetId;
                const password = <string>param.password;
                const confirm =  <string>param.confirm;

                if (Utils.existsParameters(param, condition) === false)
                {
                    res.ext.badRequest(locale);
                    break;
                }

                if (Utils.validatePassword(password) === false)
                {
                    res.ext.error(Response.Status.FAILED, R.text(R.PASSWORD_TOO_SHORT_OR_TOO_LONG, locale));
                    break;
                }

                if (param.password !== confirm)
                {
                    res.ext.error(Response.Status.FAILED, R.text(R.MISMATCH_PASSWORD, locale));
                    break;
                }

                const account = await AccountModel.findByResetId(resetId);
                if (account)
                {
                    account.password = Utils.getHashPassword(account.email, password, Config.PASSWORD_SALT);
                    account.reset_id = null;
                    await AccountModel.update(account);

                    const data : Response.ResetPassword =
                    {
                        status:  1,
                        message: R.text(R.PASSWORD_RESET, locale)
                    };
                    res.json(data);
                }
                else
                {
                    // パスワードリセットの画面でパスワードリセットを完了させた後、再度パスワードリセットを完了させようとした場合にここに到達する想定。
                    // リセットIDで該当するアカウントがないということが必ずしもパスワードリセット済みを意味するわけではないが、
                    // 第三者が直接このAPIをコールするなど、想定以外のケースでなければありえないので、パスワードリセット済みというメッセージでOK。
                    res.ext.error(Response.Status.FAILED, R.text(R.ALREADY_PASSWORD_RESET, locale));
                }
            }
            while (false);
            log.stepOut();
        }
        catch (err) {Utils.internalServerError(err, res, log)};
    }
}
