/**
 * (C) 2016 printf.jp
 */
import Config       from '../config';
import Cookie       from '../libs/cookie';
import Utils        from '../libs/utils';
import ResponseData from '../libs/response-data';
import R            from '../libs/r';
import Email        from '../auth/email';
import AccountModel, {Account} from '../models/account-model';

import express = require('express');
const co =       require('co');
const slog =     require('../slog');

/**
 * サインアップAPI
 */
export default class SignupApi
{
    private static CLS_NAME = 'SignupApi';

    /**
     * @param   {express.Request}   req httpリクエスト
     * @param   {express.Response}  res httpレスポンス
     */
    static twitter(req : express.Request, res : express.Response) : void
    {
        const log = slog.stepIn(SignupApi.CLS_NAME, 'twitter');
        SignupApi.sendResponse(req, res, 'twitter');
        log.stepOut();
    }

    /**
     * @param   {express.Request}   req httpリクエスト
     * @param   {express.Response}  res httpレスポンス
     */
    static facebook(req : express.Request, res : express.Response) : void
    {
        const log = slog.stepIn(SignupApi.CLS_NAME, 'facebook');
        SignupApi.sendResponse(req, res, 'facebook');
        log.stepOut();
    }

    /**
     * @param   {express.Request}   req httpリクエスト
     * @param   {express.Response}  res httpレスポンス
     */
    static google(req : express.Request, res : express.Response) : void
    {
        const log = slog.stepIn(SignupApi.CLS_NAME, 'google');
        SignupApi.sendResponse(req, res, 'google');
        log.stepOut();
    }

    /**
     * @param   {express.Request}   req httpリクエスト
     * @param   {express.Response}  res httpレスポンス
     */
    static email(req : express.Request, res : express.Response) : void
    {
        const log = slog.stepIn(SignupApi.CLS_NAME, 'email');
        do
        {
            const param = req.body;
            const condition =
            {
                email:    ['string', null, true],
                password: ['string', null, true]
            }

            if (Utils.existsParameters(param, condition) === false)
            {
                const data = ResponseData.error(-1, R.text(R.BAD_REQUEST));
                res.status(400).json(data);
                break;
            }

            if (Utils.validatePassword(param.password) === false)
            {
                const data = ResponseData.error(-1, R.text(R.INVALID_EMAIL_AUTH));
                res.json(data);
                break;
            }

            const hashPassword = Utils.getHashPassword(param.email, param.password, Config.PASSWORD_SALT);
            process.nextTick(() =>
            {
                Email.verify(param.email, hashPassword, (err, user) =>
                {
                    const cookie = new Cookie(req, res);
                    cookie.command = 'signup';

                    req.user = user;
                    Email.callback(req, res);
                });
            });
        }
        while (false);
        log.stepOut();
    }
    /**
     * @param   {express.Request}   req httpリクエスト
     * @param   {express.Response}  res httpレスポンス
     */
    static confirmEmail(req : express.Request, res : express.Response) : void
    {
        const log = slog.stepIn(SignupApi.CLS_NAME, 'confirmEmail');
        co(function* ()
        {
            do
            {
                const param = req.body;
                const condition =
                {
                    signup_id: ['string', null, true],
                    password:  ['string', null, true]
                }

                if (Utils.existsParameters(param, condition) === false)
                {
                    const data = ResponseData.error(-1, R.text(R.BAD_REQUEST));
                    res.status(400).json(data);
                    break;
                }

                const signupId : string = param.signup_id;
                const account : Account = yield AccountModel.findBySignupId(signupId);

                if (account === null)
                {
                    const data = ResponseData.error(-1, 'サインアップ済みです。');
                    res.json(data);
                    break;
                }

                const password : string = param.password;
                const hashPassword = Utils.getHashPassword(account.email, password, Config.PASSWORD_SALT);

                if (account.password !== hashPassword)
                {
                    const data = ResponseData.error(-1, R.text(R.INVALID_EMAIL_AUTH));
                    res.json(data);
                    break;
                }

                account.signup_id = null;
                yield AccountModel.update(account);

                const data =
                {
                    status: 1,
                    message: 'サインアップが完了しました。'
                };
                res.json(data);
            }
            while (false);
            log.stepOut();
        });
    }

    /**
     * @param   {express.Request}   req         httpリクエスト
     * @param   {express.Response}  res         httpレスポンス
     * @param   {string}            provider    プロバイダ名
     */
    private static sendResponse(req : express.Request, res : express.Response, provider : string) : void
    {
        const cookie = new Cookie(req, res);
        cookie.command = 'signup';

        const data = ResponseData.auth(provider);
        res.json(data);
    }
}
