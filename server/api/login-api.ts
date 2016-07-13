/**
 * (C) 2016 printf.jp
 */
import Config       from '../config';
import Cookie       from '../libs/cookie';
import R            from '../libs/r';
import Utils        from '../libs/utils';
import ResponseData from '../libs/response-data';
import Email        from '../auth/email';
import AccountModel, {Account} from '../models/account-model';
import SessionModel, {Session} from '../models/session-model';
import LoginHistoryModel, {LoginHistory} from '../models/login-history-model';

import express = require('express');
import slog =    require('../slog');
const co =       require('co');

/**
 * ログインAPI
 */
export default class LoginApi
{
    private static CLS_NAME = 'LoginApi';

    /**
     * Twitterアカウントでログインする<br>
     * POST /api/login/twitter
     *
     * @param   req httpリクエスト
     * @param   res httpレスポンス
     */
    static twitter(req : express.Request, res : express.Response) : void
    {
        const log = slog.stepIn(LoginApi.CLS_NAME, 'twitter');
        LoginApi.sendResponse(req, res, 'twitter');
        log.stepOut();
    }

    /**
     * Facebookアカウントでログインする<br>
     * POST /api/login/facebook
     *
     * @param   req httpリクエスト
     * @param   res httpレスポンス
     */
    static facebook(req : express.Request, res : express.Response) : void
    {
        const log = slog.stepIn(LoginApi.CLS_NAME, 'facebook');
        LoginApi.sendResponse(req, res, 'facebook');
        log.stepOut();
    }

    /**
     * Gacebookアカウントでログインする<br>
     * POST /api/login/google
     *
     * @param   req httpリクエスト
     * @param   res httpレスポンス
     */
    static google(req : express.Request, res : express.Response) : void
    {
        const log = slog.stepIn(LoginApi.CLS_NAME, 'google');
        LoginApi.sendResponse(req, res, 'google');
        log.stepOut();
    }

    /**
     * メールアドレスでログインする<br>
     * POST /api/login/email
     *
     * @param   req httpリクエスト
     * @param   res httpレスポンス
     */
    static email(req : express.Request, res : express.Response) : void
    {
        const log = slog.stepIn(LoginApi.CLS_NAME, 'email');
        co(function* ()
        {
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

                const account : Account = yield AccountModel.findByProviderId('email', param.email);
                let hashPassword : string;

                if (account)
                    hashPassword = Utils.getHashPassword(param.email, param.password, Config.PASSWORD_SALT);

                if (account === null || account.password !== hashPassword || account.signup_id)
                {
                    const data = ResponseData.error(-1, R.text(R.INVALID_EMAIL_AUTH));
                    res.json(data);
                    break;
                }

                process.nextTick(() =>
                {
                    Email.verify(param.email, hashPassword, (err, user) =>
                    {
                        const cookie = new Cookie(req, res);
                        cookie.command = 'login';

                        req.user = user;
                        Email.callback(req, res);
                    });
                });
            }
            while (false);
            log.stepOut();
        })
        .catch ((err) => Utils.internalServerError(err, res, log));
    }

    /**
     * SMSに送信したログインコードでログインする<br>
     * POST /api/login/sms
     *
     * @param   req httpリクエスト
     * @param   res httpレスポンス
     */
    static sms(req : express.Request, res : express.Response) : void
    {
        const log = slog.stepIn(LoginApi.CLS_NAME, 'sms');
        co(function* ()
        {
            do
            {
                const param = req.body;
                const condition =
                {
                    id:       ['string', null, true],
                    sms_code: ['string', null, true]
                }

                if (Utils.existsParameters(param, condition) === false)
                {
                    const data = ResponseData.error(-1, R.text(R.BAD_REQUEST));
                    res.status(400).json(data);
                    break;
                }

                const smsId = param.id;
                const account : Account = yield AccountModel.findBySmsId(smsId);

                if (account)
                {
                    if (account.sms_code !== param.sms_code)
                    {
                        const data = ResponseData.error(-1, R.text(R.MISMATCH_SMS_CODE));
                        res.json(data);
                        break;
                    }

                    account.sms_id =   null;
                    account.sms_code = null;
                    yield AccountModel.update(account);

                    // セッション作成
                    const session = new Session();
                    session.account_id = account.id;
                    yield SessionModel.add(session);

                    // ログイン履歴作成
                    const loginHistory = new LoginHistory();
                    loginHistory.account_id = account.id;
                    loginHistory.device = req.headers['user-agent'];
                    yield LoginHistoryModel.add(loginHistory);

                    const cookie = new Cookie(req, res);
                    cookie.sessionId = session.id;
                }

                // トップ画面へ
                const data = ResponseData.redirect('/');
                res.json(data);
            }
            while (false);
            log.stepOut();
        })
        .catch ((err) => Utils.internalServerError(err, res, log));
    }

    /**
     * メールアドレスでのログイン以外のレスポンス送信
     *
     * @param   req         httpリクエスト
     * @param   res         httpレスポンス
     * @param   provider    プロバイダ名
     */
    private static sendResponse(req : express.Request, res : express.Response, provider : string) : void
    {
        const cookie = new Cookie(req, res);
        cookie.command = 'login';

        const data = ResponseData.auth(provider);
        res.json(data);
    }
}
