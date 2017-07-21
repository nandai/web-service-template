/**
 * (C) 2016 printf.jp
 */
import {Response}     from 'libs/response';
import CommonUtils    from 'libs/utils';
import {PassportUser} from 'server/libs/passport';
import R              from 'server/libs/r';
import {slog}         from 'server/libs/slog';
import Utils          from 'server/libs/utils';
import {Account}      from 'server/models/account';
import {Session}      from 'server/models/session';
import Provider       from './provider';

import express =  require('express');

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
    static verify(email : string, password : string, done) : void
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
                    const contents = CommonUtils.formatString(template.contents, {url});
                    const result = await Utils.sendMail(template.subject, account.email, contents);
                    let data : Response.SignupEmail;

                    if (result)
                    {
                        data =
                        {
                            status:  Response.Status.OK,
                            message: {general:R.text(R.SIGNUP_MAIL_SENDED, locale)}
                        };
                    }
                    else
                    {
                        data =
                        {
                            status:  Response.Status.FAILED,
                            message: {general:R.text(R.COULD_NOT_SEND_SIGNUP_MAIL, locale)}
                        };
                    }

                    res.json(data);
                    resolve(result);
                });
            });
            log.stepOut();
        }
        catch (err) {Utils.internalServerError(err, res, log);}
    }

    /**
     * emailに問い合わせる
     *
     * @param   accessToken     アクセストークン
     * @param   refreshToken    リフレッシュトークン
     */
    protected inquiry(accessToken : string, _refreshToken : string)
    {
        const log = slog.stepIn(Email.CLS_NAME_2, 'inquiry');
        const self = this;

        return new Promise((resolve : () => void) =>
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
        const email = user.accessToken;
        const account : Account =
        {
            name:      email.substr(0, email.indexOf('@')),
            email,
            password:  user.refreshToken,
            signup_id: Utils.createRandomText(32)
        };
        return account;
    }

    /**
     * レスポンスを送信する
     */
    protected sendResponse(req : express.Request, res : express.Response, _session : Session, _redirect : string, phrase? : string, smsId? : string)
    {
        const log = slog.stepIn(Email.CLS_NAME_2, 'sendResponse');
        return new Promise((resolve : () => void) =>
        {
            const locale = req.ext.locale;

            if (phrase && phrase !== R.COULD_NOT_SEND_SMS)
            {
                if (phrase === R.INCORRECT_ACCOUNT) {
                    phrase =   R.INVALID_EMAIL_AUTH;
                }

                res.ext.error(Response.Status.FAILED, R.text(phrase, locale));
            }
            else
            {
                const data : Response.LoginEmail = {status:Response.Status.OK, smsId, message:{}};

                if (phrase) {
                    data.message.general = R.text(phrase, locale);
                }

                res.json(data);
            }

            log.stepOut();
            resolve();
        });
    }
}
