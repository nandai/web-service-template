/**
 * (C) 2016-2017 printf.jp
 */
import Config       from '../config';
import Utils        from '../libs/utils';
import R            from '../libs/r';
import Email        from '../provider/email';
import ProviderApi  from './provider-api';
import AccountModel, {Account} from '../models/account-model';

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
     *
     * <table>
     * <tr><td>accessToken</td>
     *     <td>アクセストークン</td></tr>
     *
     * <tr><td>accessTokenSecret</td>
     *     <td>アクセストークンシークレット。Twitterのみ</td></tr>
     * </table>
     *
     * @param   req httpリクエスト
     * @param   res httpレスポンス
     */
    static provider(req : express.Request, res : express.Response) : void
    {
        ProviderApi.provider(req, res, 'signup');
    }

    /**
     * メールアドレスでサインアップする<br>
     * POST /api/signup/email
     *
     * <table>
     * <tr><td>email</td>
     *     <td>メールアドレス</td></tr>
     *
     * <tr><td>password</td>
     *     <td>パスワード</td></tr>
     * </table>
     *
     * @param   req httpリクエスト
     * @param   res httpレスポンス
     */
    static email(req : express.Request, res : express.Response) : void
    {
        const log = slog.stepIn(SignupApi.CLS_NAME_2, 'email');
        do
        {
            const locale = req.ext.locale;
            const param =  req.body;
            const condition =
            {
                email:    ['string', null, true],
                password: ['string', null, true]
            }

            if (Utils.existsParameters(param, condition) === false)
            {
                res.ext.error(-1, R.text(R.BAD_REQUEST, locale));
                break;
            }

            if (Utils.validatePassword(param.password) === false)
            {
                res.ext.error(1, R.text(R.INVALID_EMAIL_AUTH, locale));
                break;
            }

            const hashPassword = Utils.getHashPassword(param.email, param.password, Config.PASSWORD_SALT);
            process.nextTick(() =>
            {
                Email.verify(param.email, hashPassword, (err, user) =>
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
     *
     * <table>
     * <tr><td>signup_id</td>
     *     <td>サインアップID</td></tr>
     *
     * <tr><td>password</td>
     *     <td>パスワード</td></tr>
     * </table>
     *
     * @param   req httpリクエスト
     * @param   res httpレスポンス
     */
    static async confirmEmail(req : express.Request, res : express.Response)
    {
        const log = slog.stepIn(SignupApi.CLS_NAME_2, 'confirmEmail');
        try
        {
            do
            {
                const locale = req.ext.locale;
                const param =  req.body;
                const condition =
                {
                    signupId: ['string', null, true],
                    password: ['string', null, true]
                }

                if (Utils.existsParameters(param, condition) === false)
                {
                    res.ext.error(-1, R.text(R.BAD_REQUEST, locale));
                    break;
                }

                const signupId : string = param.signupId;
                const account = await AccountModel.findBySignupId(signupId);

                if (account === null)
                {
                    // サインアップの確認画面でサインアップを完了させた後、再度サインアップを完了させようとした場合にここに到達する想定。
                    // サインアップIDで該当するアカウントがないということが必ずしもサインアップ済みを意味するわけではないが、
                    // 第三者が直接このAPIをコールするなど、想定以外のケースでなければありえないので、登録済みというメッセージでOK。
                    res.ext.error(1, R.text(R.ALREADY_SIGNUP, locale));
                    break;
                }

                const password : string = param.password;
                const hashPassword = Utils.getHashPassword(account.email, password, Config.PASSWORD_SALT);

                if (account.password !== hashPassword)
                {
                    res.ext.error(1, R.text(R.INVALID_EMAIL_AUTH, locale));
                    break;
                }

                account.signup_id = null;
                await AccountModel.update(account);

                res.ext.ok(1, R.text(R.SIGNUP_COMPLETED, locale));
            }
            while (false);
            log.stepOut();
        }
        catch (err) {Utils.internalServerError(err, res, log)};
    }
}
