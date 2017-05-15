/**
 * (C) 2016-2017 printf.jp
 */
import Config                            from '../config';
import Authy                             from '../libs/authy';
import Utils                             from '../libs/utils';
import R                                 from '../libs/r';
import Email                             from '../provider/email';
import ProviderApi                       from './provider-api';
import AccountModel, {Account}           from '../models/account-model';
import SessionModel, {Session}           from '../models/session-model';
import LoginHistoryModel, {LoginHistory} from '../models/login-history-model';
import {Request}                         from 'libs/request';
import {Response}                        from 'libs/response';

import express = require('express');
import slog =    require('../slog');

/**
 * ログインAPI
 */
export default class LoginApi extends ProviderApi
{
    private static CLS_NAME_2 = 'LoginApi';

    /**
     * ログインする<br>
     * POST /api/login/:provider
     */
    static onLoginProvider(req : express.Request, res : express.Response) : void
    {
        ProviderApi.provider(req, res, 'login');
    }

    /**
     * メールアドレスでログインする<br>
     * POST /api/login/email
     */
    static async onLoginEmail(req : express.Request, res : express.Response)
    {
        const log = slog.stepIn(LoginApi.CLS_NAME_2, 'onLoginEmail');
        try
        {
            do
            {
                const locale = req.ext.locale;
                const param     : Request.LoginEmail = req.body;
                const condition : Request.LoginEmail =
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

                const account = await AccountModel.findByProviderId('email', email);
                let hashPassword : string;

                if (account)
                    hashPassword = Utils.getHashPassword(email, password, Config.PASSWORD_SALT);

                if (account === null || account.password !== hashPassword || account.signup_id)
                {
                    res.ext.error(Response.Status.FAILED, R.text(R.INVALID_EMAIL_AUTH, locale));
                    break;
                }

                process.nextTick(() =>
                {
                    Email.verify(email, hashPassword, (err, user) =>
                    {
                        req.ext.command = 'login';
                        req.user = user;
                        Email.callback(req, res);
                    });
                });
            }
            while (false);
            log.stepOut();
        }
        catch (err) {Utils.internalServerError(err, res, log)};
    }

    /**
     * SMSに送信したログインコードでログインする<br>
     * POST /api/login/sms
     */
    static async onLoginSms(req : express.Request, res : express.Response)
    {
        const log = slog.stepIn(LoginApi.CLS_NAME_2, 'onLoginSms');
        try
        {
            do
            {
                const locale = req.ext.locale;
                const param     : Request.LoginSms= req.body;
                const condition : Request.LoginSms =
                {
                    smsId:   ['string', null, true],
                    smsCode: ['string', null, true]
                }

                if (Utils.existsParameters(param, condition) === false)
                {
                    res.ext.badRequest(locale);
                    break;
                }

                const smsId =   <string>param.smsId;
                const smsCode = <string>param.smsCode;

                const session : Session = req.ext.session;
                if (session.sms_id === smsId)
                {
                    const account = await AccountModel.find(session.account_id);
                    const canTwoFactorAuth = Utils.canTwoFactorAuth(
                        account.country_code,
                        account.phone_no,
                        account.two_factor_auth);

                    if (canTwoFactorAuth === false)
                    {
                        res.ext.badRequest(locale);
                        break;
                    }

                    let success = false;
                    switch (account.two_factor_auth)
                    {
                        case 'SMS':
                            success = (session.sms_code === smsCode);
                            break;

                        case 'Authy':
                            success = await Authy.verify(account.authy_id, Number(smsCode));
                            break;
                    }

                    if (success === false)
                    {
                        res.ext.error(Response.Status.FAILED, R.text(R.MISMATCH_SMS_CODE, locale));
                        break;
                    }

                    // セッション更新
                    session.sms_id =     null;
                    session.sms_code =   null;
                    session.authy_uuid = null;
                    await SessionModel.update(session);

                    // ログイン履歴作成
                    const loginHistory = new LoginHistory();
                    loginHistory.account_id = account.id;
                    loginHistory.device = req.headers['user-agent'];
                    await LoginHistoryModel.add(loginHistory);
                }

                const data : Response.LoginSms = {status:0};
                res.json(data);
            }
            while (false);
            log.stepOut();
        }
        catch (err) {Utils.internalServerError(err, res, log)};
    }

    /**
     * Authy OneTouchの認証ステータスをチェックする<br>
     * GET /api/login/authy/onetouch
     */
    static async onLoginAuthyOneTouch(req : express.Request, res : express.Response)
    {
        const log = slog.stepIn(LoginApi.CLS_NAME_2, 'onLoginAuthyOneTouch');
        try
        {
            do
            {
                const locale = req.ext.locale;
                const session : Session = req.ext.session;
                let approval = false;

                if (session.authy_uuid)
                {
                    approval = await Authy.checkApprovalStatus(session.authy_uuid);

                    if (approval)
                    {
                        session.sms_id =     null;
                        session.authy_uuid = null;
                        await SessionModel.update(session);
                    }
                }

                const data : Response.LoginAuthyOneTouch = {status:0, approval};
                res.json(data);
            }
            while (false);
            log.stepOut();
        }
        catch (err) {Utils.internalServerError(err, res, log)};
    }
}
