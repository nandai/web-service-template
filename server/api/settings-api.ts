/**
 * (C) 2016 printf.jp
 */
import Config                  from '../config';
import R                       from '../libs/r';
import Utils                   from '../libs/utils';
import ResponseData            from '../libs/response-data';
import AccountModel, {Account} from '../models/account-model';
import SessionModel, {Session} from '../models/session-model';
import DeleteAccountModel      from '../models/delete-account-model';

import express = require('express');
import slog =    require('../slog');
const co =       require('co');

/**
 * 設定API
 */
export default class SettingsApi
{
    private static CLS_NAME = 'SettingsApi';

    /**
     * アカウント情報を取得、または更新する
     *
     * @param   req httpリクエスト
     * @param   res httpレスポンス
     */
    static account(req : express.Request, res : express.Response) : void
    {
             if (req.method === 'GET') SettingsApi.getAccount(   req, res);
        else if (req.method === 'PUT') SettingsApi.updateAccount(req, res);
    }

    /**
     * アカウント情報を取得する<br>
     * GET /api/settings/account
     *
     * @param   req httpリクエスト
     * @param   res httpレスポンス
     */
    private static getAccount(req : express.Request, res : express.Response) : void
    {
        const log = slog.stepIn(SettingsApi.CLS_NAME, 'getAccount');
        co(function* ()
        {
            const session : Session = req['sessionObj'];
            const account : Account = yield AccountModel.find(session.account_id);
            const data =
            {
                status: 0,
                name:      account.name,
                email:     account.email,
                phone_no:  account.phone_no,
                twitter:  (account.twitter  !== null),
                facebook: (account.facebook !== null),
                google:   (account.google   !== null)
            };

            res.json(data);
            log.stepOut();
        })
        .catch ((err) => Utils.internalServerError(err, res, log));
    }

    /**
     * アカウント情報を更新する<br>
     * PUT /api/settings/account
     *
     * @param   req httpリクエスト
     * @param   res httpレスポンス
     */
    private static updateAccount(req : express.Request, res : express.Response) : void
    {
        const log = slog.stepIn(SettingsApi.CLS_NAME, 'updateAccount');
        co(function* ()
        {
            do
            {
                const param = req.body;
                const condition =
                {
                    name:     ['string', null, true],
                    phone_no: ['string', null, true]
                }

                if (Utils.existsParameters(param, condition) === false)
                {
                    const data = ResponseData.error(-1, R.text(R.BAD_REQUEST));
                    res.status(400).json(data);
                    break;
                }

                // アカウント名チェック
                const len = param.name.length;

                if (len < 1 || 20 < len)
                {
                    const data = ResponseData.error(-1, R.text(R.ACCOUNT_NAME_TOO_SHORT_OR_TOO_LONG));
                    res.json(data);
                    break;
                }

                // アカウント情報更新
                const session : Session = req['sessionObj'];
                const account : Account = yield AccountModel.find(session.account_id);

                account.name =      param.name;
                account.phone_no = (param.phone_no.length > 0 ? param.phone_no : null);
                yield AccountModel.update(account);

                const data = ResponseData.ok(1, R.text(R.SETTINGS_COMPLETED));
                res.json(data);
            }
            while (false);
            log.stepOut();
        })
        .catch ((err) => Utils.internalServerError(err, res, log));
    }

    /**
     * @param   req httpリクエスト
     * @param   res httpレスポンス
     */
    static unlinkTwitter(req : express.Request, res : express.Response) : void
    {
        const log = slog.stepIn(SettingsApi.CLS_NAME, 'unlinkTwitter');
        co(function* ()
        {
            yield SettingsApi.unlink(req, res, 'twitter');
        })
        .catch ((err) => Utils.internalServerError(err, res, log));
    }

    /**
     * @param   req httpリクエスト
     * @param   res httpレスポンス
     */
    static unlinkFacebook(req : express.Request, res : express.Response) : void
    {
        const log = slog.stepIn(SettingsApi.CLS_NAME, 'unlinkFacebook');
        co(function* ()
        {
            yield SettingsApi.unlink(req, res, 'facebook');
        })
        .catch ((err) => Utils.internalServerError(err, res, log));
    }

    /**
     * @param   req httpリクエスト
     * @param   res httpレスポンス
     */
    static unlinkGoogle(req : express.Request, res : express.Response) : void
    {
        const log = slog.stepIn(SettingsApi.CLS_NAME, 'unlinkGoogle');
        co(function* ()
        {
            yield SettingsApi.unlink(req, res, 'google');
        })
        .catch ((err) => Utils.internalServerError(err, res, log));
    }

    /**
     * @param   req         httpリクエスト
     * @param   res         httpレスポンス
     * @param   provider    プロバイダ名
     */
    static unlink(req : express.Request, res : express.Response, provider : string) : Promise<any>
    {
        const log = slog.stepIn(SettingsApi.CLS_NAME, 'unlink');
        return new Promise((resolve, reject) =>
        {
            co(function* ()
            {
                // アカウント更新
                const session : Session = req['sessionObj'];
                const account : Account = yield AccountModel.find(session.account_id);
                let data = {};

                if (account.canUnlink(provider))
                {
                    account[provider] = null;
                    yield AccountModel.update(account);

                    data = ResponseData.ok(0);
                }
                else
                {
                    data = ResponseData.error(-1, R.text(R.CANNOT_UNLINK));
                }

                res.json(data);
                resolve();
            })
            .catch ((err) => Utils.internalServerError(err, res, log));
        });
    }

    /**
     * メールアドレスの設定（変更）を要求する<br>
     * PUT /api/settings/account/email
     *
     * @param   req httpリクエスト
     * @param   res httpレスポンス
     */
    static email(req : express.Request, res : express.Response) : void
    {
        const log = slog.stepIn(SettingsApi.CLS_NAME, 'email');
        co(function* ()
        {
            do
            {
                const param = req.body;
                const condition =
                {
                    email: ['string', null, true]
                }

                if (Utils.existsParameters(param, condition) === false)
                {
                    const data = ResponseData.error(-1, R.text(R.BAD_REQUEST));
                    res.status(400).json(data);
                    break;
                }

                // メールアドレスの重複チェック
                const changeEmail = param.email;
                const alreadyExistsAccount : Account = yield AccountModel.findByProviderId('email', changeEmail);

                if (alreadyExistsAccount !== null && alreadyExistsAccount.signup_id === null)
                {
                    const data = ResponseData.error(-1, R.text(R.ALREADY_EXISTS_EMAIL));
                    res.json(data);
                    break;
                }

                // パスワードがなければメールアドレスを設定し、あれば変更メールを送信する
                const session : Session = req['sessionObj'];
                const account : Account = yield AccountModel.find(session.account_id);

                if (changeEmail === '')
                {
                    // メールアドレスを削除する場合
                    if (account.canUnlink('email'))
                    {
                        account.email = null;
                        account.password = null;
                        yield AccountModel.update(account);

                        const data = ResponseData.ok(1, R.text(R.EMAIL_CHANGED));
                        res.json(data);
                    }
                    else
                    {
                        const data = ResponseData.error(-1, R.text(R.CANNOT_EMPTY_EMAIL));
                        res.json(data);
                    }
                }

                else if (account.password === null)
                {
                    // パスワードが設定されていない場合
                    const template = R.mail(R.NOTICE_SET_MAIL_ADDRESS);
                    const result = yield Utils.sendMail(template.subject, changeEmail, template.contents);

                    if (result)
                    {
                        account.email = changeEmail;
                        yield AccountModel.update(account);
                    }

                    const data = ResponseData.ok(1, R.text(result ? R.EMAIL_CHANGED : R.COULD_NOT_CHANGE_EMAIL));
                    res.json(data);
                }

                else
                {
                    // パスワードが設定されている場合
                    const changeId = Utils.createRundomText(32);
                    const url = Utils.generateUrl('settings/account/email/change', changeId);
                    const template = R.mail(R.NOTICE_CHANGE_MAIL_ADDRESS);
                    const contents = Utils.formatString(template.contents, {url});
                    const result = yield Utils.sendMail(template.subject, changeEmail, contents);

                    if (result)
                    {
                        account.change_id = changeId;
                        account.change_email = changeEmail;
                        yield AccountModel.update(account);
                    }

                    const data = ResponseData.ok(1, R.text(result ? R.CHANGE_MAIL_SENDED : R.COULD_NOT_SEND_CHANGE_MAIL));
                    res.json(data);
                }
            }
            while (false);
            log.stepOut();
        })
        .catch ((err) => Utils.internalServerError(err, res, log));
    }

    /**
     * メールアドレスの設定（変更）を確定する<br>
     * PUT /api/settings/account/email/change
     *
     * @param   req httpリクエスト
     * @param   res httpレスポンス
     */
    static changeEmail(req : express.Request, res : express.Response) : void
    {
        const log = slog.stepIn(SettingsApi.CLS_NAME, 'changeEmail');
        co(function* ()
        {
            do
            {
                const param = req.body;
                const condition =
                {
                    change_id: ['string', null, true],
                    password:  ['string', null, true]
                }

                if (Utils.existsParameters(param, condition) === false)
                {
                    const data = ResponseData.error(-1, R.text(R.BAD_REQUEST));
                    res.status(400).json(data);
                    break;
                }

                const changeId = param.change_id;
                const account : Account = yield AccountModel.findByChangeId(changeId);

                if (account)
                {
                    // メールアドレス変更メールを送信してから確認までの間に同じメールアドレスが本登録される可能性があるため、
                    // メールアドレスの重複チェックを行う
                    const changeEmail = account.change_email;
                    const alreadyExistsAccount : Account = yield AccountModel.findByProviderId('email', changeEmail);

                    if (alreadyExistsAccount !== null && alreadyExistsAccount.signup_id === null)
                    {
                        const data = ResponseData.error(-1, R.text(R.ALREADY_EXISTS_EMAIL));
                        res.json(data);
                        break;
                    }

                    // パスワードチェック
                    const password = param.password;
                    const hashPassword = Utils.getHashPassword(account.email, password, Config.PASSWORD_SALT);

                    if (hashPassword !== account.password)
                    {
                        const data = ResponseData.error(-1, R.text(R.INVALID_PASSWORD));
                        res.json(data);
                        break;
                    }

                    // メールアドレス設定（変更）
                    account.email = changeEmail;
                    account.password = Utils.getHashPassword(changeEmail, password, Config.PASSWORD_SALT);
                    account.change_id = null;
                    account.change_email = null;
                    yield AccountModel.update(account);

                    const data = ResponseData.ok(1, R.text(R.EMAIL_CHANGED));
                    res.json(data);
                }
                else
                {
                    // メールアドレス設定の確認画面でメールアドレスの設定を完了させた後、再度メールアドレスの設定を完了させようとした場合にここに到達する想定。
                    // 変更IDで該当するアカウントがないということが必ずしもメールアドレスの設定済みを意味するわけではないが、
                    // 第三者が直接このAPIをコールするなど、想定以外のケースでなければありえないので変更済みというメッセージでOK。
                    const data = ResponseData.error(-1, R.text(R.ALREADY_EMAIL_CHANGED));
                    res.json(data);
                }
            }
            while (false);
            log.stepOut();
        })
        .catch ((err) => Utils.internalServerError(err, res, log));
    }

    /**
     * パスワードの設定（変更）を要求する<br>
     * PUT /api/settings/account/password
     *
     * @param   req httpリクエスト
     * @param   res httpレスポンス
     */
    static password(req : express.Request, res : express.Response) : void
    {
        const log = slog.stepIn(SettingsApi.CLS_NAME, 'password');
        co(function* ()
        {
            do
            {
                const param = req.body;
                const condition =
                {
                    old_password: ['string', null, true],
                    new_password: ['string', null, true],
                    confirm:      ['string', null, true]
                }

                if (Utils.existsParameters(param, condition) === false)
                {
                    const data = ResponseData.error(-1, R.text(R.BAD_REQUEST));
                    res.status(400).json(data);
                    break;
                }

                const session : Session = req['sessionObj'];
                const account : Account = yield AccountModel.find(session.account_id);

                if (account.password !== null || param.old_password !== '')
                {
                    const hashPassword = Utils.getHashPassword(account.email, param.old_password, Config.PASSWORD_SALT);

                    if (hashPassword !== account.password)
                    {
                        const data = ResponseData.error(-1, R.text(R.INVALID_PASSWORD));
                        res.json(data);
                        break;
                    }
                }

                if (Utils.validatePassword(param.new_password) === false)
                {
                    const data = ResponseData.error(-1, R.text(R.PASSWORD_TOO_SHORT_OR_TOO_LONG));
                    res.json(data);
                    break;
                }

                if (param.new_password !== param.confirm)
                {
                    const data = ResponseData.error(-1, R.text(R.MISMATCH_PASSWORD));
                    res.json(data);
                    break;
                }

                account.password = Utils.getHashPassword(account.email, param.new_password, Config.PASSWORD_SALT);
                yield AccountModel.update(account);

                const data = ResponseData.ok(1, R.text(R.PASSWORD_CHANGED));
                res.json(data);
            }
            while (false);
            log.stepOut();
        })
        .catch ((err) => Utils.internalServerError(err, res, log));
    }

    /**
     * 退会する<br>
     * DELETE /api/settings/account/leave
     *
     * @param   req httpリクエスト
     * @param   res httpレスポンス
     */
    static leave(req : express.Request, res : express.Response) : void
    {
        const log = slog.stepIn(SettingsApi.CLS_NAME, 'leave');
        co(function* ()
        {
            const session : Session = req['sessionObj'];
            const accountId = session.account_id;
            const account : Account = yield AccountModel.find(accountId);

            yield DeleteAccountModel.add(account);
            yield AccountModel.remove( accountId);
            yield SessionModel.logout({accountId});

//          req.logout();

            const data = {status:0};
            res.json(data);
            log.stepOut();
        })
        .catch ((err) => Utils.internalServerError(err, res, log));
    }
}
