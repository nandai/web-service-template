/**
 * (C) 2016-2017 printf.jp
 */
import {slog}            from 'libs/slog';
import AccountAgent      from 'server/agents/account-agent';
import LoginHistoryAgent from 'server/agents/login-history-agent';
import SessionAgent      from 'server/agents/session-agent';
import Config            from 'server/config';
import Authy             from 'server/libs/authy';
import {PassportUser}    from 'server/libs/passport';
import R                 from 'server/libs/r';
import Utils             from 'server/libs/utils';
import {Account}         from 'server/models/account';
import {LoginHistory}    from 'server/models/login-history';
import {Session}         from 'server/models/session';

import express =  require('express');
import passport = require('passport');
import twilio =   require('twilio');

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
        const handler = passport.authenticate(provider, options, (_err, user, _info) =>
        {
            if (!user)
            {
                switch (req.ext.command)
                {
                    case 'signup': res.redirect('/signup');   break;
                    case 'login':  res.redirect('/');         break;
                    case 'link':   res.redirect('/settings'); break;
                    default:       res.redirect('/');         break;
                }
            }
            else
            {
                req.login(user, options, (err) => next(err));
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

        return new Promise(async (resolve : () => void) =>
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

                const findAccount = await AccountAgent.findByProviderId(user.provider, self.id);
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
                                let account = self.createAccount(user);

                                if (findAccount === null)
                                {
                                    account = await AccountAgent.add(account);
                                }
                                else
                                {
                                    // 仮登録中のメールアドレスのアカウントに新たなサインアップIDを設定する
                                    account.id =        findAccount.id;
                                    account.invite_id = findAccount.invite_id;
                                    await AccountAgent.update(account);
                                }

                                if (signupCallback)
                                {
                                    const result = await signupCallback(account);
                                    if (result === false) {
                                        await AccountAgent.remove(account.id);
                                    }
                                }
                                else
                                {
                                    // セッション更新
                                    session.account_id = account.id;
                                    await SessionAgent.update(session);

                                    // ログイン履歴作成
                                    const loginHistory : LoginHistory =
                                    {
                                        account_id: account.id,
                                        device:     req.headers['user-agent'] as string
                                    };
                                    await LoginHistoryAgent.add(loginHistory, session.id);

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
                            if (SessionAgent.isLogin(session) === false)
                            {
                                log.i('サインアップ済み。ログインはしていないので、ログインを続行し、トップ画面へ移動する');
                                let phrase : string;
                                let isTwoFactorAuth = AccountAgent.canTwoFactorAuth(findAccount);

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
                                            if (findAccount.authy_id)
                                            {
                                                session.authy_uuid = await Authy.sendApprovalRequest(findAccount.authy_id);
                                                success = (session.authy_uuid !== null);
                                            }
                                            break;
                                    }

                                    if (success)
                                    {
                                        session.account_id = findAccount.id;
                                        session.sms_id = Utils.createRandomText(32);
                                        session.sms_code = smsCode;
                                        await SessionAgent.update(session);
                                        await AccountAgent.update(findAccount);
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
                                    await SessionAgent.update(session);

                                    // ログイン履歴作成
                                    const loginHistory : LoginHistory =
                                    {
                                        account_id: findAccount.id,
                                        device:     req.headers['user-agent'] as string
                                    };
                                    await LoginHistoryAgent.add(loginHistory, session.id);

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
                                const account = await AccountAgent.find(session.account_id);
                                account[user.provider] = self.id;
                                await AccountAgent.update(account);

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
    protected inquiry(_accessToken : string, _refreshToken : string)
    {
        return new Promise((_resolve : () => void, reject) => reject());
    }

    /**
     * アカウント作成
     */
    protected createAccount(user : PassportUser) : Account
    {
        const account : Account = {name:this.name};
        account[user.provider] = this.id;
        return account;
    }

    /**
     * レスポンスを送信する
     */
    protected sendResponse(req : express.Request, res : express.Response, session : Session, redirect : string, phrase? : string, smsId? : string)
    {
        const log = slog.stepIn(Provider.CLS_NAME, 'sendResponse');
        return new Promise(async (resolve : () => void) =>
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
                //         const data = {status:Response.Status.OK, smsId:smsId, sessionId:session.id};
                //         res.json(data);
                //     }
                }
                else
                {
                    if (phrase)
                    {
                        session.message_id = phrase;
                        await SessionAgent.update(session);
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

            const param =
            {
                body: message,
                to:   phoneNo,
                from: Config.TWILIO_FROM_PHONE_NO
            };
//          log.d(JSON.stringify(param, null, 2));

            client.messages.create(param)
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
