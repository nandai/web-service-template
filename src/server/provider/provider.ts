/**
 * (C) 2016 printf.jp
 */
import Config                            from '../config';
import Authy                             from '../libs/authy';
import {PassportUser}                    from '../libs/passport';
import R                                 from '../libs/r';
import Utils                             from '../libs/utils';
import AccountModel, {Account}           from '../models/account-model';
import LoginHistoryModel, {LoginHistory} from '../models/login-history-model';
import SessionModel, {Session}           from '../models/session-model';

import express =  require('express');
import passport = require('passport');
import twilio =   require('twilio');
import slog =     require('../slog');

/**
 * プロバイダ
 */
export default class Provider
{
    private static CLS_NAME = 'Provider';

    /**
     * プロバイダID（TwitterやFacebookなどのID）
     * inquiry()により設定される
     */
    id : string = null;

    /**
     * プロバイダでのアカウント名
     * inquiry()により設定される
     */
    name : string = null;

    /**
     * カスタムコールバック
     */
    protected static _customCallback(provider : string, req : express.Request, res : express.Response, next : express.NextFunction)
    {
        const log = slog.stepIn(Provider.CLS_NAME, '_customCallback');
        const options = {session:false};
        const handler = passport.authenticate(provider, options, (err, user, info) =>
        {
            if (!user)
            {
                switch (req.ext.command)
                {
                    case 'signup': res.redirect('/signup');   break;
                    case 'login':  res.redirect('/');         break;
                    case 'link':   res.redirect('/settings'); break;
                }
            }
            else
            {
                req.login(user, options, (_err) => next(_err));
            }
        });

        handler(req, res, next);
        log.stepOut();
    }

    /**
     * @param   provider        プロバイダ名
     * @param   accessToken     アクセストークン
     * @param   refreshToken    リフレッシュトークン
     * @param   done
     */
    protected static _verify(provider : string, accessToken : string, refreshToken : string, done) : void
    {
        const log = slog.stepIn(Provider.CLS_NAME, '_verify');
        const user : PassportUser =
        {
            provider,
            accessToken,
            refreshToken
        };
        log.d('user:' + JSON.stringify(user, null, 2));

        process.nextTick(() => done(null, user));
        log.stepOut();
    }

    /**
     * サインアップ、またはログインを行う
     *
     * @param   req             httpリクエスト
     * @param   res             httpレスポンス
     * @param   sugnupCallback  サインアップコールバック
     */
    protected signupOrLogin(req : express.Request, res : express.Response, signupCallback? : (account : Account) => Promise<boolean>)
    {
        const log = slog.stepIn(Provider.CLS_NAME, 'signupOrLogin');
        const self = this;

        return new Promise(async (resolve : () => void, reject) =>
        {
            try
            {
                const user : PassportUser = req.user;

                self.id = null;
                await self.inquiry(user.accessToken, user.refreshToken);

                if (self.id === null)
                {
                    log.w('プロバイダにアカウントが存在しない。');
                    res.status(400).send('!?');
                    log.stepOut();
                    resolve();
                    return;
                }

                const findAccount = await AccountModel.findByProviderId(user.provider, self.id);
                const session : Session = req.ext.session;
                const command =           req.ext.command;

                if (session === undefined) {
                    log.e('sessionがありません。');
                }

                switch (command)
                {
                    case 'signup':
                    {
                        // サインアップ処理
//                      if (findAccount === null)
//                      if (findAccount === null || findAccount.signup_id)
                        if (findAccount === null || findAccount.signup_id || findAccount.invite_id)
                        {
                            if (session.account_id === null)
                            {
                                log.i('サインアップ可能。ログインもしていないので、サインアップを続行し、トップ画面へ移動する');

                                // アカウント作成
                                const account = self.createAccount(user);

                                if (findAccount === null)
                                {
                                    await AccountModel.add(account);
                                }
                                else
                                {
                                    // 仮登録中のメールアドレスのアカウントに新たなサインアップIDを設定する
                                    account.id =        findAccount.id;
                                    account.invite_id = findAccount.invite_id;
                                    await AccountModel.update(account);
                                }

                                if (signupCallback)
                                {
                                    const result = await signupCallback(account);
                                    if (result === false) {
                                        await AccountModel.remove(account.id);
                                    }
                                }
                                else
                                {
                                    // セッション更新
                                    session.account_id = account.id;
                                    await SessionModel.update(session);

                                    // ログイン履歴作成
                                    const loginHistory = new LoginHistory();
                                    loginHistory.account_id = account.id;
                                    loginHistory.device = req.headers['user-agent'];
                                    await LoginHistoryModel.add(loginHistory);

                                    // トップ画面へ
                                    await self.sendResponse(req, res, session, '/');
                                }
                            }
                            else
                            {
                                log.i('サインアップ可能だが、ログイン中なので、サインアップはせず、サインアップ画面へ移動する');

                                // サインアップ画面へ
                                await self.sendResponse(req, res, session, '/signup', R.CANNOT_SIGNUP);
                            }
                        }
                        else
                        {
                            log.i('サインアップ済みなので、サインアップはせず、サインアップ画面へ移動する');

                            // サインアップ画面へ
                            await self.sendResponse(req, res, session, '/signup', R.ALREADY_SIGNUP);
                        }
                        break;
                    }

                    case 'login':
                    {
                        // ログイン処理
                        if (findAccount)
                        {
                            if (session.account_id === null)
                            {
                                log.i('サインアップ済み。ログインはしていないので、ログインを続行し、トップ画面へ移動する');
                                let phrase : string;
                                let isTwoFactorAuth = findAccount.canTwoFactorAuth();

                                if (isTwoFactorAuth)
                                {
                                    let success = false;
                                    let smsCode : string;

                                    switch (findAccount.two_factor_auth)
                                    {
                                        case 'SMS':
                                            smsCode = Utils.createRandomText(6, true);

                                            // ログインコードをSMS送信
                                            const locale = req.ext.locale;
                                            const message = R.text(R.SMS_LOGIN_CODE, locale);
                                            success = await this.sendSms(findAccount.international_phone_no, `${message}：${smsCode}`);
                                            break;

                                        case 'Authy':
                                            success = true;
                                            session.authy_uuid = await Authy.sendApprovalRequest(findAccount.authy_id);
                                            break;
                                    }

                                    if (success)
                                    {
                                        session.account_id = findAccount.id;
                                        session.sms_id = Utils.createRandomText(32);
                                        session.sms_code = smsCode;
                                        await SessionModel.update(session);
                                        await AccountModel.update(findAccount);
                                        await self.sendResponse(req, res, session, '/', null, session.sms_id);
                                    }
                                    else
                                    {
                                        isTwoFactorAuth = false;
                                        phrase = R.COULD_NOT_SEND_SMS;
                                    }
                                }

                                if (isTwoFactorAuth === false)
                                {
                                    // セッション作成
                                    session.account_id = findAccount.id;
                                    await SessionModel.update(session);

                                    // ログイン履歴作成
                                    const loginHistory = new LoginHistory();
                                    loginHistory.account_id = findAccount.id;
                                    loginHistory.device = req.headers['user-agent'];
                                    await LoginHistoryModel.add(loginHistory);

                                    // トップ画面へ
                                    await self.sendResponse(req, res, session, '/', phrase);
                                }
                            }
                            else
                            {
                                if (session.account_id === findAccount.id)
                                {
                                    log.i('サインアップ済み。既に同じアカウントでログインしているので、トップ画面へ移動するだけ');

                                    // トップ画面へ
                                    await self.sendResponse(req, res, session, '/');
                                }
                                else
                                {
                                    log.i('サインアップ済みだが、別のアカウントでログイン中なので、トップ画面ではなくログイン画面へ移動する');

                                    // ログイン画面へ
                                    await self.sendResponse(req, res, session, '/', R.ALREADY_LOGIN_ANOTHER_ACCOUNT);
                                }
                            }
                        }
                        else
                        {
                            log.i('サインアップしていないので、ログイン画面へ移動する');

                            // ログイン画面へ
                            await self.sendResponse(req, res, session, '/', R.INCORRECT_ACCOUNT);
                        }
                        break;
                    }

                    case 'link':
                    {
                        // 紐づけ処理
                        if (findAccount === null)
                        {
                            if (session.account_id)
                            {
                                log.i('紐づけ可能。ログインしているので、紐づけを続行し、設定画面へ移動する');

                                // アカウント更新
                                const account = await AccountModel.find(session.account_id);
                                account[user.provider] = self.id;
                                await AccountModel.update(account);

                                // 設定画面へ
                                await self.sendResponse(req, res, session, '/settings');
                            }
                            else
                            {
                            }
                        }
                        else
                        {
                            // 設定画面へ
                            await self.sendResponse(req, res, session, '/settings', R.CANNOT_LINK);
                        }
                        break;
                    }

                    default:
                    {
                        log.e(`command '${command}' が正しくありません。`);
                        res.status(400).send('!?');
                        break;
                    }
                }

                log.stepOut();
                resolve();
            }
            catch (err) {Utils.internalServerError(err, res, log);}
        });
    }

    /**
     * プロバイダに問い合わせる
     */
    protected inquiry(accessToken : string, refreshToken : string)
    {
        return new Promise((resolve : () => void, reject) => reject());
    }

    /**
     * アカウント作成
     */
    protected createAccount(user : PassportUser) : Account
    {
        const account = new Account();
        account[user.provider] = this.id;
        account.name = this.name;
        return account;
    }

    /**
     * レスポンスを送信する
     */
    protected sendResponse(req : express.Request, res : express.Response, session : Session, redirect : string, phrase? : string, smsId? : string)
    {
        const log = slog.stepIn(Provider.CLS_NAME, 'sendResponse');
        return new Promise(async (resolve : () => void, reject) =>
        {
            try
            {
                if (req.path.startsWith('/api/'))
                {
                    const message = '不要と思われた処理に侵入！';
                    log.e(message);
                    res.ext.badRequest(message);

                //     if (phrase)
                //     {
                //         const locale = req.ext.locale;
                //         res.ext.error(Response.Status.FAILED, R.text(phrase, locale));
                //     }
                //     else
                //     {
                //         const data = {status:0, smsId:smsId, sessionId:session.id};
                //         res.json(data);
                //     }
                }
                else
                {
                    if (phrase)
                    {
                        session.message_id = phrase;
                        await SessionModel.update(session);
                    }

                    if (smsId) {
                        redirect += `?id=${smsId}`;
                    }

                    res.redirect(redirect);
                }

                log.stepOut();
                resolve();
            }
            catch (err) {Utils.internalServerError(err, res, log);}
        });
    }

    /**
     * SMSを送信する
     */
    private sendSms(phoneNo : string, message : string)
    {
        const log = slog.stepIn(Provider.CLS_NAME, 'sendSms');
        return new Promise((resolve : (success : boolean) => void) =>
        {
            const accountSid = Config.TWILIO_ACCOUNT_SID;
            const authToken =  Config.TWILIO_AUTH_TOKEN;
            const client = new twilio(accountSid, authToken);

            client.messages.create(
            {
                body: message,
                to:   phoneNo,
                from: Config.TWILIO_FROM_PHONE_NO
            })
            .then((_message) =>
            {
//              log.d(_message)
                log.stepOut();
                resolve(true);
            })
            .catch((err) =>
            {
                log.w(err.message);
                log.stepOut();
                resolve(false);
            });
        });
    }
}
