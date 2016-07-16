/**
 * (C) 2016 printf.jp
 */
import Config                  from '../config';
import Cookie                  from '../libs/cookie';
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
        co(function* ()
        {
            const log = slog.stepIn(SettingsApi.CLS_NAME, 'getAccount');
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
        });
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
        co(function* ()
        {
            const log = slog.stepIn(SettingsApi.CLS_NAME, 'updateAccount');
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
        const log = slog.stepIn(SettingsApi.CLS_NAME, 'index');
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
                const email = param.email;
                const alreadyExistsAccount : Account = yield AccountModel.findByProviderId('email', email);

                if (alreadyExistsAccount !== null && alreadyExistsAccount.signup_id === null)
                {
                    const data = ResponseData.error(-1, R.text(R.ALREADY_EXISTS_EMAIL));
                    res.json(data);
                    break;
                }

                // パスワードがなければメールアドレスを設定し、あれば変更メールを送信する
                const session : Session = req['sessionObj'];
                const account : Account = yield AccountModel.find(session.account_id);

                if (account.password === null)
                {
                    account.email = (email !== '' ? email : null);
                    yield AccountModel.update(account);

                    const data = ResponseData.ok(1, R.text(R.EMAIL_CHANGED));
                    res.json(data);
                }
                else
                {
                    account.change_id = Utils.createRundomText(32);
                    account.change_email = email;
                    yield AccountModel.update(account);

                    const url = Utils.generateUrl('settings/account/email/change', account.change_id);
                    const template = R.mail(R.NOTICE_CHANGE_MAIL_ADDRESS);
                    const contents = Utils.formatString(template.contents, {url});
                    const result = yield Utils.sendMail(template.subject, account.change_email, contents);
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
                const hashPassword = Utils.getHashPassword(account.email, param.old_password, Config.PASSWORD_SALT);

                if (hashPassword !== account.password)
                {
                    const data = ResponseData.error(-1, R.text(R.INVALID_PASSWORD));
                    res.json(data);
                    break;
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
        co(function* ()
        {
            const log = slog.stepIn(SettingsApi.CLS_NAME, 'leave');
            const cookie = new Cookie(req, res);
            const session : Session = req['sessionObj'];
            const accountId = session.account_id;
            const account : Account = yield AccountModel.find(accountId);

            yield DeleteAccountModel.add(account);
            yield AccountModel.remove( accountId);
            yield SessionModel.remove({accountId});

//          req.logout();
            cookie.sessionId = null;

            const data = {status:0};
            res.json(data);
            log.stepOut();
        });
    }
}
