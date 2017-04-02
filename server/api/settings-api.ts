/**
 * (C) 2016-2017 printf.jp
 */
import Config                  from '../config';
import R                       from '../libs/r';
import Utils                   from '../libs/utils';
import AccountModel, {Account} from '../models/account-model';
import SessionModel, {Session} from '../models/session-model';
import DeleteAccountModel      from '../models/delete-account-model';
import {Response}              from 'libs/response';

import express = require('express');
import slog =    require('../slog');

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
    private static async getAccount(req : express.Request, res : express.Response)
    {
        const log = slog.stepIn(SettingsApi.CLS_NAME, 'getAccount');
        try
        {
            const session : Session = req.ext.session;
            const account = await AccountModel.find(session.account_id);

            const resAccount : Response.Account =
            {
                name:      account.name,
                email:     account.email,
                phoneNo:   account.phone_no,
                twitter:  (account.twitter  !== null),
                facebook: (account.facebook !== null),
                google:   (account.google   !== null)
            };

            const data =
            {
                status:  0,
                account: resAccount
            }

            res.json(data);
            log.stepOut();
        }
        catch (err) {Utils.internalServerError(err, res, log)};
    }

    /**
     * アカウント情報を更新する<br>
     * PUT /api/settings/account
     *
     * <table>
     * <tr><td>name</td>
     *     <td>アカウント名</td></tr>
     *
     * <tr><td>phone_no</td>
     *     <td>電話番号。+81xxxxxxxxxxx</td></tr>
     * </table>
     *
     * @param   req httpリクエスト
     * @param   res httpレスポンス
     */
    private static async updateAccount(req : express.Request, res : express.Response)
    {
        const log = slog.stepIn(SettingsApi.CLS_NAME, 'updateAccount');
        try
        {
            do
            {
                const locale = req.ext.locale;
                const param =  req.body;
                const condition =
                {
                    name:    ['string', null, true],
                    phoneNo: ['string', null, true]
                }

                if (Utils.existsParameters(param, condition) === false)
                {
                    res.ext.error(-1, R.text(R.BAD_REQUEST, locale));
                    break;
                }

                // アカウント名チェック
                const len = param.name.length;

                if (len < 1 || 20 < len)
                {
                    res.ext.error(1, R.text(R.ACCOUNT_NAME_TOO_SHORT_OR_TOO_LONG, locale));
                    break;
                }

                // アカウント情報更新
                const session : Session = req.ext.session;
                const account = await AccountModel.find(session.account_id);

                account.name =      param.name;
                account.phone_no = (param.phoneNo && param.phoneNo.length > 0 ? param.phoneNo : null);
                await AccountModel.update(account);

                res.ext.ok(1, R.text(R.SETTINGS_COMPLETED, locale));
            }
            while (false);
            log.stepOut();
        }
        catch (err) {Utils.internalServerError(err, res, log)};
    }

    /**
     * 紐づけを解除する<br>
     * PUT /api/settings/account/unlink/:provider
     *
     * @param   req httpリクエスト
     * @param   res httpレスポンス
     */
    static async unlink(req : express.Request, res : express.Response)
    {
        const log = slog.stepIn(SettingsApi.CLS_NAME, 'unlink');
        try
        {
            // アカウント更新
            const provider : string = req.params.provider;
            log.d(`${provider}`);

            const session : Session = req.ext.session;
            const account = await AccountModel.find(session.account_id);

            if (account.canUnlink(provider))
            {
                account[provider] = null;
                await AccountModel.update(account);

                res.ext.ok(0);
            }
            else
            {
                const locale = req.ext.locale;
                res.ext.error(1, R.text(R.CANNOT_UNLINK, locale));
            }
        }
        catch (err) {Utils.internalServerError(err, res, log)};
    }

    /**
     * メールアドレスの設定（変更）を要求する<br>
     * PUT /api/settings/account/email
     *
     * <table>
     * <tr><td>email</td>
     *     <td>メールアドレス</td></tr>
     * </table>
     *
     * @param   req httpリクエスト
     * @param   res httpレスポンス
     */
    static async email(req : express.Request, res : express.Response)
    {
        const log = slog.stepIn(SettingsApi.CLS_NAME, 'email');
        try
        {
            do
            {
                const locale = req.ext.locale;
                const param =  req.body;
                const condition =
                {
                    email: ['string', null, true]
                }

                if (Utils.existsParameters(param, condition) === false)
                {
                    res.ext.error(-1, R.text(R.BAD_REQUEST, locale));
                    break;
                }

                // メールアドレスの重複チェック
                const changeEmail = param.email;
                const alreadyExistsAccount = await AccountModel.findByProviderId('email', changeEmail);

                if (alreadyExistsAccount !== null && alreadyExistsAccount.signup_id === null)
                {
                    res.ext.error(1, R.text(R.ALREADY_EXISTS_EMAIL, locale));
                    break;
                }

                // パスワードがなければメールアドレスを設定し、あれば変更メールを送信する
                const session : Session = req.ext.session;
                const account = await AccountModel.find(session.account_id);

                if (changeEmail === '')
                {
                    // メールアドレスを削除する場合
                    if (account.canUnlink('email'))
                    {
                        account.email = null;
                        account.password = null;
                        await AccountModel.update(account);

                        res.ext.ok(1, R.text(R.EMAIL_CHANGED, locale));
                    }
                    else
                    {
                        res.ext.error(1, R.text(R.CANNOT_EMPTY_EMAIL, locale));
                    }
                }

                else if (account.password === null)
                {
                    // パスワードが設定されていない場合
                    const template = R.mail(R.NOTICE_SET_MAIL_ADDRESS, locale);
                    const result = await Utils.sendMail(template.subject, changeEmail, template.contents);

                    if (result)
                    {
                        account.email = changeEmail;
                        await AccountModel.update(account);
                    }

                    res.ext.ok(1, R.text(result ? R.EMAIL_CHANGED : R.COULD_NOT_CHANGE_EMAIL, locale));
                }

                else
                {
                    // パスワードが設定されている場合
                    const changeId = Utils.createRundomText(32);
                    const url = Utils.generateUrl('settings/account/email/change', changeId);
                    const template = R.mail(R.NOTICE_CHANGE_MAIL_ADDRESS, locale);
                    const contents = Utils.formatString(template.contents, {url});
                    const result = await Utils.sendMail(template.subject, changeEmail, contents);

                    if (result)
                    {
                        account.change_id = changeId;
                        account.change_email = changeEmail;
                        await AccountModel.update(account);
                    }

                    res.ext.ok(1, R.text(result ? R.CHANGE_MAIL_SENDED : R.COULD_NOT_SEND_CHANGE_MAIL, locale));
                }
            }
            while (false);
            log.stepOut();
        }
        catch (err) {Utils.internalServerError(err, res, log)};
    }

    /**
     * メールアドレスの設定（変更）を確定する<br>
     * PUT /api/settings/account/email/change
     *
     * <table>
     * <tr><td>change_id</td>
     *     <td>変更ID</td></tr>
     *
     * <tr><td>password</td>
     *     <td>パスワード</td></tr>
     * </table>
     *
     * @param   req httpリクエスト
     * @param   res httpレスポンス
     */
    static async changeEmail(req : express.Request, res : express.Response)
    {
        const log = slog.stepIn(SettingsApi.CLS_NAME, 'changeEmail');
        try
        {
            do
            {
                const locale = req.ext.locale;
                const param =  req.body;
                const condition =
                {
                    changeId: ['string', null, true],
                    password: ['string', null, true]
                }

                if (Utils.existsParameters(param, condition) === false)
                {
                    res.ext.error(-1, R.text(R.BAD_REQUEST, locale));
                    break;
                }

                const changeId = param.changeId;
                const account = await AccountModel.findByChangeId(changeId);

                if (account)
                {
                    // メールアドレス変更メールを送信してから確認までの間に同じメールアドレスが本登録される可能性があるため、
                    // メールアドレスの重複チェックを行う
                    const changeEmail = account.change_email;
                    const alreadyExistsAccount = await AccountModel.findByProviderId('email', changeEmail);

                    if (alreadyExistsAccount !== null && alreadyExistsAccount.signup_id === null)
                    {
                        res.ext.error(1, R.text(R.ALREADY_EXISTS_EMAIL, locale));
                        break;
                    }

                    // パスワードチェック
                    const password = param.password;
                    const hashPassword = Utils.getHashPassword(account.email, password, Config.PASSWORD_SALT);

                    if (hashPassword !== account.password)
                    {
                        res.ext.error(1, R.text(R.INVALID_PASSWORD, locale));
                        break;
                    }

                    // メールアドレス設定（変更）
                    account.email = changeEmail;
                    account.password = Utils.getHashPassword(changeEmail, password, Config.PASSWORD_SALT);
                    account.change_id = null;
                    account.change_email = null;
                    await AccountModel.update(account);

                    res.ext.ok(1, R.text(R.EMAIL_CHANGED, locale));
                }
                else
                {
                    // メールアドレス設定の確認画面でメールアドレスの設定を完了させた後、再度メールアドレスの設定を完了させようとした場合にここに到達する想定。
                    // 変更IDで該当するアカウントがないということが必ずしもメールアドレスの設定済みを意味するわけではないが、
                    // 第三者が直接このAPIをコールするなど、想定以外のケースでなければありえないので変更済みというメッセージでOK。
                    res.ext.error(1, R.text(R.ALREADY_EMAIL_CHANGED, locale));
                }
            }
            while (false);
            log.stepOut();
        }
        catch (err) {Utils.internalServerError(err, res, log)};
    }

    /**
     * パスワードの設定（変更）を要求する<br>
     * PUT /api/settings/account/password
     *
     * <table>
     * <tr><td>old_password</td>
     *     <td>現在のパスワード</td></tr>
     *
     * <tr><td>new_password</td>
     *     <td>新しいパスワード</td></tr>
     *
     * <tr><td>confirm</td>
     *     <td>確認のパスワード</td></tr>
     * </table>
     *
     * @param   req httpリクエスト
     * @param   res httpレスポンス
     */
    static async password(req : express.Request, res : express.Response)
    {
        const log = slog.stepIn(SettingsApi.CLS_NAME, 'password');
        try
        {
            do
            {
                const locale = req.ext.locale;
                const param =  req.body;
                const condition =
                {
                    oldPassword: ['string', null, true],
                    newPassword: ['string', null, true],
                    confirm:     ['string', null, true]
                }

                if (Utils.existsParameters(param, condition) === false)
                {
                    res.ext.error(-1, R.text(R.BAD_REQUEST, locale));
                    break;
                }

                const session : Session = req.ext.session;
                const account = await AccountModel.find(session.account_id);

                if (account.password !== null || param.oldPassword !== '')
                {
                    const hashPassword = Utils.getHashPassword(account.email, param.oldPassword, Config.PASSWORD_SALT);

                    if (hashPassword !== account.password)
                    {
                        res.ext.error(1, R.text(R.INVALID_PASSWORD, locale));
                        break;
                    }
                }

                if (Utils.validatePassword(param.newPassword) === false)
                {
                    res.ext.error(1, R.text(R.PASSWORD_TOO_SHORT_OR_TOO_LONG, locale));
                    break;
                }

                if (param.newPassword !== param.confirm)
                {
                    res.ext.error(1, R.text(R.MISMATCH_PASSWORD, locale));
                    break;
                }

                account.password = Utils.getHashPassword(account.email, param.newPassword, Config.PASSWORD_SALT);
                await AccountModel.update(account);

                res.ext.ok(1, R.text(R.PASSWORD_CHANGED, locale));
            }
            while (false);
            log.stepOut();
        }
        catch (err) {Utils.internalServerError(err, res, log)};
    }

    /**
     * 退会する<br>
     * DELETE /api/settings/account/leave
     *
     * @param   req httpリクエスト
     * @param   res httpレスポンス
     */
    static async leave(req : express.Request, res : express.Response)
    {
        const log = slog.stepIn(SettingsApi.CLS_NAME, 'leave');
        try
        {
            const session : Session = req.ext.session;
            const accountId = session.account_id;
            const account = await AccountModel.find(accountId);

            await DeleteAccountModel.add(account);
            await AccountModel.remove( accountId);
            await SessionModel.logout({accountId});

//          req.logout();

            const data = {status:0};
            res.json(data);
            log.stepOut();
        }
        catch (err) {Utils.internalServerError(err, res, log)};
    }
}
