/**
 * (C) 2016 printf.jp
 */
import Provider       from './provider';
import {PassportUser} from '../libs/passport';
import R              from '../libs/r';
import Utils          from '../libs/utils';
import ResponseData   from '../libs/response-data';
import {Account}      from '../models/account-model';
import {Session}      from '../models/session-model';

import express =  require('express');
import passport = require('passport');
import slog =     require('../slog');
const co =        require('co');

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
    static callback(req : express.Request, res : express.Response) : void
    {
        const log = slog.stepIn(Email.CLS_NAME_2, 'callback');
        co(function* ()
        {
            const email = new Email();
            yield email.signupOrLogin(req, res, (account : Account) : Promise<any> =>
            {
                return new Promise((resolve) =>
                {
                    co(function* ()
                    {
                        const url = Utils.generateUrl('signup', account.signup_id);
                        const template = R.mail(R.NOTICE_SIGNUP, req['locale']);
                        const contents = Utils.formatString(template.contents, {url});
                        const result : boolean = yield Utils.sendMail(template.subject, account.email, contents);
                        const locale : string = req['locale'];
                        const data = ResponseData.ok(1, R.text(result ? R.SIGNUP_MAIL_SENDED : R.COULD_NOT_SEND_SIGNUP_MAIL, locale));
                        res.json(data);
                        resolve(result);
                    });
                });
            });
            log.stepOut();
        })
        .catch ((err) => Utils.internalServerError(err, res, log));
    }

    /**
     * emailに問い合わせる
     *
     * @param   accessToken     アクセストークン
     * @param   refreshToken    リフレッシュトークン
     */
    protected inquiry(accessToken : string, refreshToken : string) : Promise<any>
    {
        const log = slog.stepIn(Email.CLS_NAME_2, 'inquiry');
        const self = this;

        return new Promise((resolve, reject) =>
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
    protected sendResponse(req : express.Request, res : express.Response, session : Session, redirect : string, phrase? : string, smsId? : string) : Promise<any>
    {
        const log = slog.stepIn(Email.CLS_NAME_2, 'sendResponse');
        return new Promise((resolve, reject) =>
        {
            if (phrase)
            {
                if (phrase === R.INCORRECT_ACCOUNT)
                    phrase =   R.INVALID_EMAIL_AUTH;

                const locale = req['locale'];
                const data = ResponseData.error(-1, R.text(phrase, locale));
                res.json(data);
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
