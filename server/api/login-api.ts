/**
 * (C) 2016 printf.jp
 */
import Config       from '../config';
import Utils        from '../libs/utils';
import ResponseData from '../libs/response-data';
import R            from '../libs/r';
import Email        from '../provider/email';
import ProviderApi  from './provider-api';
import AccountModel, {Account} from '../models/account-model';
import SessionModel, {Session} from '../models/session-model';
import LoginHistoryModel, {LoginHistory} from '../models/login-history-model';

import express = require('express');
import slog =    require('../slog');
const co =       require('co');

/**
 * ログインAPI
 */
export default class LoginApi extends ProviderApi
{
    private static CLS_NAME_2 = 'LoginApi';

    /**
     * ログインする<br>
     * POST /api/login/:provider<br>
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
        ProviderApi.provider(req, res, 'login');
    }

    /**
     * メールアドレスでログインする<br>
     * POST /api/login/email<br>
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
        const log = slog.stepIn(LoginApi.CLS_NAME_2, 'email');
        co(function* ()
        {
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

                const email : string = param.email;
                const account : Account = yield AccountModel.findByProviderId('email', email);
                let hashPassword : string;

                if (account)
                    hashPassword = Utils.getHashPassword(email, param.password, Config.PASSWORD_SALT);

                if (account === null || account.password !== hashPassword || account.signup_id)
                {
                    const data = ResponseData.error(-1, R.text(R.INVALID_EMAIL_AUTH, locale));
                    res.json(data);
                    break;
                }

                process.nextTick(() =>
                {
                    Email.verify(email, hashPassword, (err, user) =>
                    {
                        req['command'] = 'login';
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
     * <table>
     * <tr><td>sms_id</td>
     *     <td>SMS ID。二段階認証画面に遷移する前に発行されるID</td></tr>
     *
     * <tr><td>sms_code</td>
     *     <td>SMSコード（ログインコード）。二段階認証画面に遷移する前に発行されるコード</td></tr>
     * </table>
     *
     * @param   req httpリクエスト
     * @param   res httpレスポンス
     */
    static sms(req : express.Request, res : express.Response) : void
    {
        const log = slog.stepIn(LoginApi.CLS_NAME_2, 'sms');
        co(function* ()
        {
            do
            {
                const locale : string = req['locale'];
                const param = req.body;
                const condition =
                {
                    sms_id:   ['string', null, true],
                    sms_code: ['string', null, true]
                }

                if (Utils.existsParameters(param, condition) === false)
                {
                    const data = ResponseData.error(-1, R.text(R.BAD_REQUEST, locale));
                    res.status(400).json(data);
                    break;
                }

                const smsId = param.sms_id;
                const account : Account = yield AccountModel.findBySmsId(smsId);

                if (account)
                {
                    if (account.sms_code !== param.sms_code)
                    {
                        const data = ResponseData.error(-1, R.text(R.MISMATCH_SMS_CODE, locale));
                        res.json(data);
                        break;
                    }

                    account.sms_id =   null;
                    account.sms_code = null;
                    yield AccountModel.update(account);

                    // セッション更新
                    const session : Session = req['sessionObj'];
                    session.account_id = account.id;
                    yield SessionModel.update(session);

                    // ログイン履歴作成
                    const loginHistory = new LoginHistory();
                    loginHistory.account_id = account.id;
                    loginHistory.device = req.headers['user-agent'];
                    yield LoginHistoryModel.add(loginHistory);
                }

                // トップ画面へ
                const data = ResponseData.ok(0);
                res.json(data);
            }
            while (false);
            log.stepOut();
        })
        .catch ((err) => Utils.internalServerError(err, res, log));
    }
}
