/**
 * (C) 2016 printf.jp
 */
import Config                            from '../config';
import {PassportUser}                    from '../libs/passport';
import Cookie                            from '../libs/cookie';
import Utils                             from '../libs/utils';
import AccountModel, {Account}           from '../models/account-model';
import SessionModel, {Session}           from '../models/session-model';
import LoginHistoryModel, {LoginHistory} from '../models/login-history-model';

import express =  require('express');
import passport = require('passport');
import slog =     require('../slog');
const co =        require('co');
const twilio =    require('twilio');

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
                const cookie = new Cookie(req, res);
                switch (cookie.command)
                {
                    case 'signup': res.redirect('/signup');   break;
                    case 'login':  res.redirect('/');         break;
                    case 'link':   res.redirect('/settings'); break;
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
     * @param   accessToken     アクセストークン
     * @param   refreshToken    リフレッシュトークン
     * @param   profile         プロフィール
     * @param   done
     */
    protected static _verify(accessToken : string, refreshToken : string, profile : passport.Profile, done : Function) : void
    {
        const log = slog.stepIn(Provider.CLS_NAME, '_verify');
        const user : PassportUser =
        {
            provider:     profile.provider,
            name:         profile.displayName,
            accessToken:  accessToken,
            refreshToken: refreshToken
        };
        log.d('user:'    + JSON.stringify(user,    null, 2));
        log.d('profile:' + JSON.stringify(profile, null, 2));

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
    protected signupOrLogin(req : express.Request, res : express.Response, signupCallback? : (account : Account) => Promise<any>) : Promise<any>
    {
        const log = slog.stepIn(Provider.CLS_NAME, 'signupOrLogin');
        const self = this;

        return new Promise((resolve, reject) =>
        {
            co(function* ()
            {
                const user : PassportUser = req.user;

                self.id = null;
                yield self.inquiry(user.accessToken, user.refreshToken);

                if (self.id === null)
                {
                    log.i('プロバイダにアカウントが存在しない。');
                    res.status(400).send('!?');
                    log.stepOut();
                    resolve();
                    return;
                }

                const findAccount : Account = yield AccountModel.findByProviderId(user.provider, self.id);
                const cookie = new Cookie(req, res);
                const sessionId = cookie.sessionId;
                const session : Session = yield SessionModel.find(sessionId);

                const command = cookie.command;
                cookie.command = null;

                switch (command)
                {
                    case 'signup':
                    {
                        // サインアップ処理
                        if (findAccount === null)
                        {
                            if (session === null)
                            {
                                log.i('サインアップ可能。ログインもしていないので、サインアップを続行し、トップ画面へ移動する');

                                // アカウント作成
                                const account = self.createAccount(user);
                                yield AccountModel.add(account);

                                if (signupCallback)
                                {
                                    yield signupCallback(account);
                                }
                                else
                                {
                                    // セッション作成
                                    const session = new Session();
                                    session.account_id = account.id;
                                    yield SessionModel.add(session);

                                    // ログイン履歴作成
                                    const loginHistory = new LoginHistory();
                                    loginHistory.account_id = account.id;
                                    loginHistory.device = req.headers['user-agent'];
                                    yield LoginHistoryModel.add(loginHistory);

                                    // トップ画面へ
                                    cookie.sessionId = session.id;
                                    self.sendResponse(res, cookie, '/');
                                }
                            }
                            else
                            {
                                log.i('サインアップ可能だが、ログイン中なので、サインアップはせず、サインアップ画面へ移動する');

                                // サインアップ画面へ
                                self.sendResponse(res, cookie, '/signup', Cookie.MESSAGE_CANNOT_SIGNUP);
                            }
                        }
                        else
                        {
                            log.i('サインアップ済みなので、サインアップはせず、サインアップ画面へ移動する');

                            // サインアップ画面へ
                            self.sendResponse(res, cookie, '/signup', Cookie.MESSAGE_ALREADY_SIGNUP);
                        }
                        break;
                    }

                    case 'login':
                    {
                        // ログイン処理
                        if (findAccount)
                        {
                            if (session === null)
                            {
                                log.i('サインアップ済み。ログインはしていないので、ログインを続行し、トップ画面へ移動する');

                                if (findAccount.phone_no !== null)
                                {
                                    // TODO:二段階認証画面へ。いまのところは仮の処理としてSMSを送信する
                                    if (Config.TWILIO_ACCOUNT_SID   !== ''
                                    &&  Config.TWILIO_AUTH_TOKEN    !== ''
                                    &&  Config.TWILIO_FROM_PHONE_NO !== '')
                                    {
                                        findAccount.sms_id =   Utils.createRundomText(32);
                                        findAccount.sms_code = Utils.createRundomText( 6, true);
                                        AccountModel.update(findAccount);

                                        self.sendResponse(res, cookie, `?id=${findAccount.sms_id}`);

                                        // ログインコードをSMS送信
                                        const accountSid = Config.TWILIO_ACCOUNT_SID;
                                        const authToken =  Config.TWILIO_AUTH_TOKEN;

                                        var client = new twilio.RestClient(accountSid, authToken);

                                        client.messages.create(
                                        {
                                            body: `ログインコード：${findAccount.sms_code}`,
                                            to: findAccount.phone_no,
                                            from: Config.TWILIO_FROM_PHONE_NO
                                        }, (err, message) =>
                                        {
                                            if (err)
                                                log.d(err.message);
                                        });
                                    }
                                }
                                else
                                {
                                    // セッション作成
                                    const session = new Session();
                                    session.account_id = findAccount.id;
                                    yield SessionModel.add(session);

                                    // ログイン履歴作成
                                    const loginHistory = new LoginHistory();
                                    loginHistory.account_id = findAccount.id;
                                    loginHistory.device = req.headers['user-agent'];
                                    yield LoginHistoryModel.add(loginHistory);

                                    // トップ画面へ
                                    cookie.sessionId = session.id;
                                    self.sendResponse(res, cookie, '/');
                                }
                            }
                            else
                            {
                                if (session.account_id === findAccount.id)
                                {
                                    log.i('サインアップ済み。既に同じアカウントでログインしているので、トップ画面へ移動するだけ');

                                    // トップ画面へ
                                    self.sendResponse(res, cookie, '/');
                                }
                                else
                                {
                                    log.i('サインアップ済みだが、別のアカウントでログイン中なので、トップ画面ではなくログイン画面へ移動する');

                                    // ログイン画面へ
                                    self.sendResponse(res, cookie, '/', Cookie.MESSAGE_ALREADY_LOGIN_ANOTHER_ACCOUNT);
                                }
                            }
                        }
                        else
                        {
                            log.i('サインアップしていないので、ログイン画面へ移動する');

                            // ログイン画面へ
                            self.sendResponse(res, cookie, '/', Cookie.MESSAGE_INCORRECT_ACCOUNT);
                        }
                        break;
                    }

                    case 'link':
                    {
                        // 紐付け処理
                        if (findAccount === null)
                        {
                            if (session)
                            {
                                log.i('紐付け可能。ログインしているので、紐付けを続行し、設定画面へ移動する');

                                // アカウント更新
                                const account : Account = yield AccountModel.find(session.account_id);
                                account[`${user.provider}`] = self.id;
                                yield AccountModel.update(account);

                                // 設定画面へ
                                self.sendResponse(res, cookie, '/settings');
                            }
                            else
                            {
                            }
                        }
                        else
                        {
                        }
                        break;
                    }
                }

                log.stepOut();
                resolve();
            })
            .catch ((err) => Utils.internalServerError(err, res, log));
        });
    }

    /**
     * プロバイダに問い合わせる
     */
    protected inquiry(accessToken : string, refreshToken : string) : Promise<any>
    {
        return new Promise((resolve, reject) => reject());
    }

    /**
     * アカウント作成
     */
    protected createAccount(user : PassportUser) : Account
    {
        const account = new Account();
        account[`${user.provider}`] = this.id;
        account.name = user.name;
        return account;
    }

    /**
     * レスポンスを送信する
     */
    protected sendResponse(res : express.Response, cookie : Cookie, redirect : string, messageId? : string) : void
    {
        if (messageId)
            cookie.messageId = messageId;

        res.redirect(redirect);
    }
}
