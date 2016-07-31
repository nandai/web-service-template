/**
 * (C) 2016 printf.jp
 */
import Config                            from '../config';
import {PassportUser}                    from '../libs/passport';
import R                                 from '../libs/r';
import Utils                             from '../libs/utils';
import ResponseData                      from '../libs/response-data';
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
                switch (req['command'])
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
     * @param   provider        プロバイダ名
     * @param   accessToken     アクセストークン
     * @param   refreshToken    リフレッシュトークン
     * @param   done
     */
    protected static _verify(provider : string, accessToken : string, refreshToken : string, done : Function) : void
    {
        const log = slog.stepIn(Provider.CLS_NAME, '_verify');
        const user : PassportUser =
        {
            provider:     provider,
            accessToken:  accessToken,
            refreshToken: refreshToken
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
                const session : Session = req['sessionObj'];
                const command : string =  req['command'];

                switch (command)
                {
                    case 'signup':
                    {
                        // サインアップ処理
//                      if (findAccount === null)
                        if (findAccount === null || findAccount.signup_id)
                        {
                            if (session.account_id === null)
                            {
                                log.i('サインアップ可能。ログインもしていないので、サインアップを続行し、トップ画面へ移動する');

                                // アカウント作成
                                const account = self.createAccount(user);

                                if (findAccount === null)
                                {
                                    yield AccountModel.add(account);
                                }
                                else
                                {
                                    // 仮登録中のメールアドレスのアカウントに新たなサインアップIDを設定する
                                    account.id = findAccount.id;
                                    yield AccountModel.update(account);
                                }

                                if (signupCallback)
                                {
                                    const result : boolean = yield signupCallback(account);
                                    if (result === false)
                                        yield AccountModel.remove(account.id);
                                }
                                else
                                {
                                    // セッション更新
                                    session.account_id = account.id;
                                    yield SessionModel.update(session);

                                    // ログイン履歴作成
                                    const loginHistory = new LoginHistory();
                                    loginHistory.account_id = account.id;
                                    loginHistory.device = req.headers['user-agent'];
                                    yield LoginHistoryModel.add(loginHistory);

                                    // トップ画面へ
                                    yield self.sendResponse(req, res, session, '/');
                                }
                            }
                            else
                            {
                                log.i('サインアップ可能だが、ログイン中なので、サインアップはせず、サインアップ画面へ移動する');

                                // サインアップ画面へ
                                yield self.sendResponse(req, res, session, '/signup', R.CANNOT_SIGNUP);
                            }
                        }
                        else
                        {
                            log.i('サインアップ済みなので、サインアップはせず、サインアップ画面へ移動する');

                            // サインアップ画面へ
                            yield self.sendResponse(req, res, session, '/signup', R.ALREADY_SIGNUP);
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

                                if (findAccount.phone_no !== null)
                                {
                                    if (Config.TWILIO_ACCOUNT_SID   !== ''
                                    &&  Config.TWILIO_AUTH_TOKEN    !== ''
                                    &&  Config.TWILIO_FROM_PHONE_NO !== '')
                                    {
                                        findAccount.sms_id =   Utils.createRundomText(32);
                                        findAccount.sms_code = Utils.createRundomText( 6, true);
                                        AccountModel.update(findAccount);

                                        yield self.sendResponse(req, res, session, '/', null, findAccount.sms_id);

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
                                    session.account_id = findAccount.id;
                                    yield SessionModel.update(session);

                                    // ログイン履歴作成
                                    const loginHistory = new LoginHistory();
                                    loginHistory.account_id = findAccount.id;
                                    loginHistory.device = req.headers['user-agent'];
                                    yield LoginHistoryModel.add(loginHistory);

                                    // トップ画面へ
                                    yield self.sendResponse(req, res, session, '/');
                                }
                            }
                            else
                            {
                                if (session.account_id === findAccount.id)
                                {
                                    log.i('サインアップ済み。既に同じアカウントでログインしているので、トップ画面へ移動するだけ');

                                    // トップ画面へ
                                    yield self.sendResponse(req, res, session, '/');
                                }
                                else
                                {
                                    log.i('サインアップ済みだが、別のアカウントでログイン中なので、トップ画面ではなくログイン画面へ移動する');

                                    // ログイン画面へ
                                    yield self.sendResponse(req, res, session, '/', R.ALREADY_LOGIN_ANOTHER_ACCOUNT);
                                }
                            }
                        }
                        else
                        {
                            log.i('サインアップしていないので、ログイン画面へ移動する');

                            // ログイン画面へ
                            yield self.sendResponse(req, res, session, '/', R.INCORRECT_ACCOUNT);
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
                                const account : Account = yield AccountModel.find(session.account_id);
                                account[user.provider] = self.id;
                                yield AccountModel.update(account);

                                // 設定画面へ
                                yield self.sendResponse(req, res, session, '/settings');
                            }
                            else
                            {
                            }
                        }
                        else
                        {
                            // 設定画面へ
                            yield self.sendResponse(req, res, session, '/settings', R.CANNOT_LINK);
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
        account[user.provider] = this.id;
        account.name = this.name;
        return account;
    }

    /**
     * レスポンスを送信する
     */
    protected sendResponse(req : express.Request, res : express.Response, session : Session, redirect : string, phrase? : string, smsId? : string) : Promise<any>
    {
        const log = slog.stepIn(Provider.CLS_NAME, 'sendResponse');
        return new Promise((resolve, reject) =>
        {
            co(function* ()
            {
                if (req.path.startsWith('/api/'))
                {
                    if (phrase)
                    {
                        const locale = req['locale'];
                        const data = ResponseData.error(-1, R.text(phrase, locale));
                        res.json(data);
                    }
                    else
                    {
                        const data = {status:0, smsId:smsId, sessionId:session.id};
                        res.json(data);
                    }
                }
                else
                {
                    if (phrase)
                    {
                        session.message_id = phrase;
                        yield SessionModel.update(session);
                    }

                    if (smsId)
                        redirect += `?id=${smsId}`;

                    res.redirect(redirect);
                }

                log.stepOut();
                resolve();
            })
            .catch ((err) => Utils.internalServerError(err, res, log));
        });
    }
}
