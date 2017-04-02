/**
 * (C) 2016 printf.jp
 */
import Provider       from './provider';
import {PassportUser} from '../libs/passport';
import R              from '../libs/r';
import Utils          from '../libs/utils';
import {Account}      from '../models/account-model';
import {Session}      from '../models/session-model';

import express =  require('express');
import passport = require('passport');
import slog =     require('../slog');

/**
 * Email
 */
export default class Email extends Provider
{
    private static CLS_NAME_2 = 'Email';

    /**
     * @param   accessToken     アクセストークン
     * @param   refreshToken    リフレッシュトークン
     * @param   profile         プロフィール
     * @param   done
     */
    static verify(email : string, password : string, done : Function) : void
    {
        super._verify('email', email, password, done);
    }

    /**
     * emailからのコールバック用
     *
     * @param   req httpリクエスト
     * @param   res httpレスポンス
     */
    static async callback(req : express.Request, res : express.Response)
    {
        const log = slog.stepIn(Email.CLS_NAME_2, 'callback');
        try
        {
            const email = new Email();
            await email.signupOrLogin(req, res, (account : Account) : Promise<boolean> =>
            {
                return new Promise(async (resolve : BooleanResolve) =>
                {
                    const url = Utils.generateUrl('signup', account.signup_id);
                    const locale = req.ext.locale;
                    const template = R.mail(R.NOTICE_SIGNUP, locale);
                    const contents = Utils.formatString(template.contents, {url});
                    const result = await Utils.sendMail(template.subject, account.email, contents);
                    res.ext.ok(1, R.text(result ? R.SIGNUP_MAIL_SENDED : R.COULD_NOT_SEND_SIGNUP_MAIL, locale));
                    resolve(result);
                });
            });
            log.stepOut();
        }
        catch (err) {Utils.internalServerError(err, res, log)};
    }

    /**
     * emailに問い合わせる
     *
     * @param   accessToken     アクセストークン
     * @param   refreshToken    リフレッシュトークン
     */
    protected inquiry(accessToken : string, refreshToken : string)
    {
        const log = slog.stepIn(Email.CLS_NAME_2, 'inquiry');
        const self = this;

        return new Promise((resolve : () => void, reject) =>
        {
            self.id = accessToken;  // email
            log.stepOut();
            resolve();
        });
    }

    /**
     * アカウント作成
     */
    protected createAccount(user : PassportUser) : Account
    {
        const account = new Account();
        const email = user.accessToken;
        account.name =      email.substr(0, email.indexOf('@'));
        account.email =     email;
        account.password =  user.refreshToken;
        account.signup_id = Utils.createRundomText(32);
        return account;
    }

    /**
     * レスポンスを送信する
     */
    protected sendResponse(req : express.Request, res : express.Response, session : Session, redirect : string, phrase? : string, smsId? : string)
    {
        const log = slog.stepIn(Email.CLS_NAME_2, 'sendResponse');
        return new Promise((resolve : () => void, reject) =>
        {
            if (phrase)
            {
                if (phrase === R.INCORRECT_ACCOUNT)
                    phrase =   R.INVALID_EMAIL_AUTH;

                const locale = req.ext.locale;
                res.ext.error(1, R.text(phrase, locale));
            }
            else
            {
                const data = {status:0, smsId:smsId, sessionId:session.id};
                res.json(data);
            }

            log.stepOut();
            resolve();
        });
    }
}
