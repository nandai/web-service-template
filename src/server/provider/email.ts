/**
 * (C) 2016-2018 printf.jp
 */
import {Response}     from 'libs/response';
import {slog}         from 'libs/slog';
import CommonUtils    from 'libs/utils';
import {PassportUser} from 'server/libs/passport';
import R              from 'server/libs/r';
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
            await email.signupOrLogin(req, res, async (account : Account) : Promise<boolean> =>
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
                return result;
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
    protected async inquiry(accessToken : string, _refreshToken : string) : Promise<void>
    {
        const log = slog.stepIn(Email.CLS_NAME_2, 'inquiry');
        this.id = accessToken;  // email
        log.stepOut();
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
    protected async sendResponse(
        req       : express.Request,
        res       : express.Response,
        _session  : Session,
        _redirect : string,
        phrase?   : string,
        smsId?    : string) : Promise<void>
    {
        const log = slog.stepIn(Email.CLS_NAME_2, 'sendResponse');
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
    }
}
