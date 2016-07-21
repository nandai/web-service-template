/**
 * (C) 2016 printf.jp
 */
import Config       from '../config';
import Utils        from '../libs/utils';
import ResponseData from '../libs/response-data';
import R            from '../libs/r';
import Email        from '../provider/email';
import AccountModel, {Account} from '../models/account-model';

import express = require('express');
import slog =    require('../slog');
const co =       require('co');

/**
 * サインアップAPI
 */
export default class SignupApi
{
    private static CLS_NAME = 'SignupApi';

    /**
     * メールアドレスでサインアップする<br>
     * POST /api/signup/email
     *
     * @param   req httpリクエスト
     * @param   res httpレスポンス
     */
    static email(req : express.Request, res : express.Response) : void
    {
        const log = slog.stepIn(SignupApi.CLS_NAME, 'email');
        do
        {
            const locale : string = req['locale'];
            const param = req.body;
            const condition =
            {
                email:    ['string', null, true],
                password: ['string', null, true]
            }

            if (Utils.existsParameters(param, condition) === false)
            {
                const data = ResponseData.error(-1, R.text(R.BAD_REQUEST, locale));
                res.status(400).json(data);
                break;
            }

            if (Utils.validatePassword(param.password) === false)
            {
                const data = ResponseData.error(-1, R.text(R.INVALID_EMAIL_AUTH, locale));
                res.json(data);
                break;
            }

            const hashPassword = Utils.getHashPassword(param.email, param.password, Config.PASSWORD_SALT);
            process.nextTick(() =>
            {
                Email.verify(param.email, hashPassword, (err, user) =>
                {
                    req['command'] = 'signup';
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
     *
     * @param   req httpリクエスト
     * @param   res httpレスポンス
     */
    static confirmEmail(req : express.Request, res : express.Response) : void
    {
        const log = slog.stepIn(SignupApi.CLS_NAME, 'confirmEmail');
        co(function* ()
        {
            do
            {
                const locale : string = req['locale'];
                const param = req.body;
                const condition =
                {
                    signup_id: ['string', null, true],
                    password:  ['string', null, true]
                }

                if (Utils.existsParameters(param, condition) === false)
                {
                    const data = ResponseData.error(-1, R.text(R.BAD_REQUEST, locale));
                    res.status(400).json(data);
                    break;
                }

                const signupId : string = param.signup_id;
                const account : Account = yield AccountModel.findBySignupId(signupId);

                if (account === null)
                {
                    // サインアップの確認画面でサインアップを完了させた後、再度サインアップを完了させようとした場合にここに到達する想定。
                    // サインアップIDで該当するアカウントがないということが必ずしもサインアップ済みを意味するわけではないが、
                    // 第三者が直接このAPIをコールするなど、想定以外のケースでなければありえないので、登録済みというメッセージでOK。
                    const data = ResponseData.error(-1, R.text(R.ALREADY_SIGNUP, locale));
                    res.json(data);
                    break;
                }

                const password : string = param.password;
                const hashPassword = Utils.getHashPassword(account.email, password, Config.PASSWORD_SALT);

                if (account.password !== hashPassword)
                {
                    const data = ResponseData.error(-1, R.text(R.INVALID_EMAIL_AUTH, locale));
                    res.json(data);
                    break;
                }

                account.signup_id = null;
                yield AccountModel.update(account);

                const data = ResponseData.ok(1, R.text(R.SIGNUP_COMPLETED, locale));
                res.json(data);
            }
            while (false);
            log.stepOut();
        })
        .catch ((err) => Utils.internalServerError(err, res, log));
    }
}
