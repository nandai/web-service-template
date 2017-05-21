/**
 * (C) 2016-2017 printf.jp
 */
import Config                  from '../config';
import Utils                   from '../libs/utils';
import R                       from '../libs/r';
import Email                   from '../provider/email';
import ProviderApi             from './provider-api';
import AccountModel, {Account} from '../models/account-model';
import {Request}               from 'libs/request';
import {Response}              from 'libs/response';

import express = require('express');
import slog =    require('../slog');

/**
 * サインアップAPI
 */
export default class SignupApi extends ProviderApi
{
    private static CLS_NAME_2 = 'SignupApi';

    /**
     * サインアップする<br>
     * POST /api/signup/:provider<br>
     */
    static onSignupProvider(req : express.Request, res : express.Response) : void
    {
        ProviderApi.provider(req, res, 'signup');
    }

    /**
     * メールアドレスでサインアップする<br>
     * POST /api/signup/email
     */
    static onSignupEmail(req : express.Request, res : express.Response) : void
    {
        const log = slog.stepIn(SignupApi.CLS_NAME_2, 'onSignupEmail');
        do
        {
            const locale = req.ext.locale;
            const param     : Request.SignupEmail = req.body;
            const condition : Request.SignupEmail =
            {
                email:    ['string', null, true],
                password: ['string', null, true]
            }

            if (Utils.existsParameters(param, condition) === false)
            {
                res.ext.badRequest(locale);
                break;
            }

            const email =    <string>param.email;
            const password = <string>param.password;

            if (Utils.validatePassword(password) === false)
            {
                res.ext.error(Response.Status.FAILED, R.text(R.INVALID_EMAIL_AUTH, locale));
                break;
            }

            const hashPassword = Utils.getHashPassword(email, password, Config.PASSWORD_SALT);
            process.nextTick(() =>
            {
                Email.verify(email, hashPassword, (err, user) =>
                {
                    req.ext.command = 'signup';
                    req.user = user;
                    Email.callback(req, res);
                });
            });
        }
        while (false);
        log.stepOut();
    }

    /**
     * メールアドレスでのサインアップを確定する<br>
     * POST /api/signup/email/confirm
     */
    static async onConfirmSignupEmail(req : express.Request, res : express.Response)
    {
        const log = slog.stepIn(SignupApi.CLS_NAME_2, 'onConfirmSignupEmail');
        try
        {
            do
            {
                const locale = req.ext.locale;
                const param     : Request.ConfirmSignupEmail = req.body;
                const condition : Request.ConfirmSignupEmail =
                {
                    signupId: ['string', null, true],
                    password: ['string', null, true]
                }

                if (Utils.existsParameters(param, condition) === false)
                {
                    res.ext.badRequest(locale);
                    break;
                }

                const signupId = <string>param.signupId;
                const password = <string>param.password;

                const account = await AccountModel.findBySignupId(signupId);
                if (account === null)
                {
                    // サインアップの確認画面でサインアップを完了させた後、再度サインアップを完了させようとした場合にここに到達する想定。
                    // サインアップIDで該当するアカウントがないということが必ずしもサインアップ済みを意味するわけではないが、
                    // 第三者が直接このAPIをコールするなど、想定以外のケースでなければありえないので、登録済みというメッセージでOK。
                    res.ext.error(Response.Status.FAILED, R.text(R.ALREADY_SIGNUP, locale));
                    break;
                }

                const hashPassword = Utils.getHashPassword(account.email, password, Config.PASSWORD_SALT);

                if (account.password !== hashPassword)
                {
                    res.ext.error(Response.Status.FAILED, R.text(R.INVALID_EMAIL_AUTH, locale));
                    break;
                }

                account.signup_id = null;
                account.invite_id = null;
                await AccountModel.update(account);

                const data : Response.ResetPassword =
                {
                    status:  1,
                    message: R.text(R.SIGNUP_COMPLETED, locale)
                };
                res.json(data);
            }
            while (false);
            log.stepOut();
        }
        catch (err) {Utils.internalServerError(err, res, log)};
    }

    /**
     * 参加する<br>
     * POST /api/join
     */
    static async onJoin(req : express.Request, res : express.Response)
    {
        const log = slog.stepIn(SignupApi.CLS_NAME_2, 'onJoin');
        try
        {
            do
            {
                const locale = req.ext.locale;
                const param     : Request.Join = req.body;
                const condition : Request.Join =
                {
                    inviteId: ['string', null, true],
                    password: ['string', null, true]
                }

                if (Utils.existsParameters(param, condition) === false)
                {
                    res.ext.badRequest(locale);
                    break;
                }

                const inviteId = <string>param.inviteId;
                const password = <string>param.password;

                if (Utils.validatePassword(password) === false)
                {
                    res.ext.error(Response.Status.FAILED, R.text(R.PASSWORD_TOO_SHORT_OR_TOO_LONG, locale));
                    break;
                }

                const account = await AccountModel.findByInviteId(inviteId);
                if (account === null)
                {
                    // 参加画面で参加を完了させた後、再度参加を完了させようとした場合にここに到達する想定。
                    // 招待IDで該当するアカウントがないということが必ずしも参加済みを意味するわけではないが、
                    // 第三者が直接このAPIをコールするなど、想定以外のケースでなければありえないので、登録済みというメッセージでOK。
                    res.ext.error(Response.Status.FAILED, R.text(R.ALREADY_JOIN, locale));
                    break;
                }

                const hashPassword = Utils.getHashPassword(account.email, password, Config.PASSWORD_SALT);

                account.password =  hashPassword;
                account.signup_id = null;
                account.invite_id = null;
                await AccountModel.update(account);

                const data : Response.Join =
                {
                    status:  1,
                    message: R.text(R.SIGNUP_COMPLETED, locale)
                };
                res.json(data);
            }
            while (false);
            log.stepOut();
        }
        catch (err) {Utils.internalServerError(err, res, log)};
    }
}
