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

                const account = await AccountModel.findBySmsId(smsId);
                if (account)
                {
                    let success = false;
                    switch (account.two_factor_auth)
                    {
                        case 'SMS':
                            success = (account.sms_code === smsCode);
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

                    account.sms_id =   null;
                    account.sms_code = null;
                    await AccountModel.update(account);

                    // セッション更新
                    const session : Session = req.ext.session;
                    session.account_id = account.id;
                    await SessionModel.update(session);

                    // ログイン履歴作成
                    const loginHistory = new LoginHistory();
                    loginHistory.account_id = account.id;
                    loginHistory.device = req.headers['user-agent'];
                    await LoginHistoryModel.add(loginHistory);
                }

                // トップ画面へ
                const data : Response.LoginSms = {status:0};
                res.json(data);
            }
            while (false);
            log.stepOut();
        }
        catch (err) {Utils.internalServerError(err, res, log)};
    }
}
