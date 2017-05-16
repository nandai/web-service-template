/**
 * (C) 2016-2017 printf.jp
 */
import Config                  from '../config';
import Authy                   from '../libs/authy';
import R                       from '../libs/r';
import Utils                   from '../libs/utils';
import AccountModel, {Account} from '../models/account-model';
import SessionModel, {Session} from '../models/session-model';
import DeleteAccountModel      from '../models/delete-account-model';
import {Request}               from 'libs/request';
import {Response}              from 'libs/response';

import express = require('express');
import slog =    require('../slog');

const lookup = require('country-data').lookup;

/**
 * 設定API
 */
export default class SettingsApi
{
    private static CLS_NAME = 'SettingsApi';

    /**
     * アカウント取得<br>
     * GET /api/settings/account
     */
    static async onGetAccount(req : express.Request, res : express.Response)
    {
        const log = slog.stepIn(SettingsApi.CLS_NAME, 'onGetAccount');
        try
        {
            const data = await SettingsApi.getAccount(req);
            res.json(data);
            log.stepOut();
        }
        catch (err) {Utils.internalServerError(err, res, log)};
    }

    /**
     * アカウント取得
     */
    static getAccount(req : express.Request)
    {
        return new Promise(async (resolve : (data : Response.GetAccount) => void, reject) =>
        {
            const log = slog.stepIn(SettingsApi.CLS_NAME, 'getAccount');
            try
            {
                const session : Session = req.ext.session;
                const account = await AccountModel.find(session.account_id);
                const accountRes : Response.Account =
                {
                    name:          account.name,
                    email:         account.email,
                    countryCode:   account.country_code,
                    phoneNo:       account.phone_no,
                    twoFactorAuth: account.two_factor_auth,
                    twitter:      (account.twitter  !== null),
                    facebook:     (account.facebook !== null),
                    google:       (account.google   !== null)
                };

                const data : Response.GetAccount =
                {
                    status:  0,
                    account: accountRes
                }

                log.stepOut();
                resolve(data);
            }
            catch (err) {log.stepOut(); reject(err)};
        });
    }

    /**
     * アカウント設定<br>
     * PUT /api/settings/account
     */
    static async onSetAccount(req : express.Request, res : express.Response)
    {
        const log = slog.stepIn(SettingsApi.CLS_NAME, 'onSetAccount');
        try
        {
            do
            {
                const locale = req.ext.locale;
                const param     : Request.SetAccount = req.body;
                const condition : Request.SetAccount =
                {
                    name:          ['string', null, true],
                    countryCode:   ['string', null, true],
                    phoneNo:       ['string', null, true],
                    twoFactorAuth: ['string', null, true]
                }

                log.d(JSON.stringify(param, null, 2));

                if (Utils.existsParameters(param, condition) === false)
                {
                    res.ext.badRequest(locale);
                    break;
                }

                const name =          <string>param.name;
                const countryCode =   <string>param.countryCode;
                const phoneNo =       <string>param.phoneNo;
                const twoFactorAuth = <string>param.twoFactorAuth;

                // アカウント名チェック
                const len = name.length;

                if (len < 1 || 20 < len)
                {
                    res.ext.error(Response.Status.FAILED, R.text(R.ACCOUNT_NAME_TOO_SHORT_OR_TOO_LONG, locale));
                    break;
                }

                // 国コードチェック
                if (countryCode)
                {
                    const countries : any[] = lookup.countries({countryCallingCodes:countryCode});
                    if (countries.length === 0)
                    {
                        // TODO:フロント側をリスト形式にする予定なのでとりあえず直文字列
                        res.ext.error(Response.Status.FAILED, '国コードが正しくありません。');
                        break;
                    }
                }

                // 二段階認証方式チェック
                switch (twoFactorAuth)
                {
                    case 'SMS':
                    case 'Authy':
                    case null:
                        break;

                    default:
                        res.ext.badRequest(locale);
                        break;
                }

                // アカウント情報更新
                const session : Session = req.ext.session;
                const account = await AccountModel.find(session.account_id);
                const prevCountryCode = account.country_code;
                const prevPhoneNo =     account.phone_no;
                const newCountryCode = (countryCode && countryCode.length > 0 ? countryCode : null);
                const newPhoneNo =     (phoneNo     && phoneNo    .length > 0 ? phoneNo     : null);

                if (account.authy_id && prevPhoneNo && prevPhoneNo !== newPhoneNo)
                {
                    // authyからユーザー削除
                    await Authy.deleteUser(account.authy_id);
                    account.authy_id = null;
                }

                if (twoFactorAuth === 'Authy'
                && account.email
                && newCountryCode
                && newPhoneNo
                && (newCountryCode !== prevCountryCode || newPhoneNo !== prevPhoneNo || account.authy_id === null))
                {
                    // authyにユーザー登録
                    account.authy_id = await Authy.registerUser(account.email, newCountryCode.substr(1), newPhoneNo);
                }

                account.name =            name;
                account.country_code =    newCountryCode;
                account.phone_no =        newPhoneNo;
                account.two_factor_auth = twoFactorAuth;
                await AccountModel.update(account);

                const data : Response.SetAccount =
                {
                    status:  1,
                    message: R.text(R.SETTINGS_COMPLETED, locale)
                };
                res.json(data);
            }
            while (false);
            log.stepOut();
        }
        catch (err) {Utils.internalServerError(err, res, log)};
    }

    /**
     * 紐づけを解除する<br>
     * PUT /api/settings/account/unlink
     */
    static async onUnlinkProvider(req : express.Request, res : express.Response)
    {
        const log = slog.stepIn(SettingsApi.CLS_NAME, 'onUnlinkProvider');
        try
        {
            do
            {
                const locale = req.ext.locale;
                const param     : Request.UnlinkProvider = req.body;
                const condition : Request.UnlinkProvider =
                {
                    provider: ['string', null, true]
                }

                if (Utils.existsParameters(param, condition) === false)
                {
                    res.ext.badRequest(locale);
                    break;
                }

                // プロバイダ名チェック
                const provider = <string>param.provider;
                log.d(`${provider}`);

                if (provider !== 'twitter'
                &&  provider !== 'facebook'
                &&  provider !== 'google')
                {
                    res.ext.badRequest(locale);
                    break;
                }

                // アカウント更新
                const session : Session = req.ext.session;
                const account = await AccountModel.find(session.account_id);

                if (account.canUnlink(provider))
                {
                    account[provider] = null;
                    await AccountModel.update(account);

                    const data : Response.UnlinkProvider = {status:0};
                    res.json(data);
                }
                else
                {
                    const locale = req.ext.locale;
                    res.ext.error(Response.Status.FAILED, R.text(R.CANNOT_UNLINK, locale));
                }
            }
            while (false);
            log.stepOut();
        }
        catch (err) {Utils.internalServerError(err, res, log)};
    }

    /**
     * メールアドレスの変更を要求する<br>
     * PUT /api/settings/account/email
     */
    static async onRequestChangeEmail(req : express.Request, res : express.Response)
    {
        const log = slog.stepIn(SettingsApi.CLS_NAME, 'onRequestChangeEmail');
        try
        {
            do
            {
                const locale = req.ext.locale;
                const param     : Request.RequestChangeEmail = req.body;
                const condition : Request.RequestChangeEmail =
                {
                    email: ['string', null, true]
                }

                if (Utils.existsParameters(param, condition) === false)
                {
                    res.ext.badRequest(locale);
                    break;
                }

                const changeEmail = <string>param.email;

                // メールアドレスの重複チェック
                const alreadyExistsAccount = await AccountModel.findByProviderId('email', changeEmail);

//              if (alreadyExistsAccount !== null && alreadyExistsAccount.signup_id === null)
                if (alreadyExistsAccount !== null)
                {
                    res.ext.error(Response.Status.FAILED, R.text(R.ALREADY_EXISTS_EMAIL, locale));
                    break;
                }

                // パスワードがなければメールアドレスを設定し、あれば変更メールを送信する
                const session : Session = req.ext.session;
                const account = await AccountModel.find(session.account_id);

                if (changeEmail === null || changeEmail === '')
                {
                    // メールアドレスを削除する場合
                    if (account.canUnlink('email'))
                    {
                        account.email = null;
                        account.password = null;
                        await AccountModel.update(account);

                        const data : Response.RequestChangeEmail =
                        {
                            status:  1,
                            message: R.text(R.EMAIL_CHANGED, locale)
                        };
                        res.json(data);
                    }
                    else
                    {
                        res.ext.error(Response.Status.FAILED, R.text(R.CANNOT_EMPTY_EMAIL, locale));
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

                    const data : Response.RequestChangeEmail =
                    {
                        status:  1,
                        message: R.text(result ? R.EMAIL_CHANGED : R.COULD_NOT_CHANGE_EMAIL, locale)
                    };
                    res.json(data);
                }

                else
                {
                    // パスワードが設定されている場合
                    const changeId = Utils.createRandomText(32);
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

                    const data : Response.RequestChangeEmail =
                    {
                        status:  1,
                        message: R.text(result ? R.CHANGE_MAIL_SENDED : R.COULD_NOT_SEND_CHANGE_MAIL, locale)
                    };
                    res.json(data);
                }
            }
            while (false);
            log.stepOut();
        }
        catch (err) {Utils.internalServerError(err, res, log)};
    }

    /**
     * メールアドレスを変更する<br>
     * PUT /api/settings/account/email/change
     */
    static async onChangeEmail(req : express.Request, res : express.Response)
    {
        const log = slog.stepIn(SettingsApi.CLS_NAME, 'onChangeEmail');
        try
        {
            do
            {
                const locale = req.ext.locale;
                const param     : Request.ChangeEmail = req.body;
                const condition : Request.ChangeEmail =
                {
                    changeId: ['string', null, true],
                    password: ['string', null, true]
                }

                if (Utils.existsParameters(param, condition) === false)
                {
                    res.ext.badRequest(locale);
                    break;
                }

                const changeId = <string>param.changeId;
                const password = <string>param.password;

                const account = await AccountModel.findByChangeId(changeId);
                if (account)
                {
                    // メールアドレス変更メールを送信してから確認までの間に同じメールアドレスが本登録される可能性があるため、
                    // メールアドレスの重複チェックを行う
                    const changeEmail = account.change_email;
                    const alreadyExistsAccount = await AccountModel.findByProviderId('email', changeEmail);

                    if (alreadyExistsAccount !== null && alreadyExistsAccount.signup_id === null)
                    {
                        res.ext.error(Response.Status.FAILED, R.text(R.ALREADY_EXISTS_EMAIL, locale));
                        break;
                    }

                    // パスワードチェック
                    const hashPassword = Utils.getHashPassword(account.email, password, Config.PASSWORD_SALT);

                    if (hashPassword !== account.password)
                    {
                        res.ext.error(Response.Status.FAILED, R.text(R.INVALID_PASSWORD, locale));
                        break;
                    }

                    // メールアドレス設定（変更）
                    account.email = changeEmail;
                    account.password = Utils.getHashPassword(changeEmail, password, Config.PASSWORD_SALT);
                    account.change_id = null;
                    account.change_email = null;
                    await AccountModel.update(account);

                    const data : Response.ChangeEmail =
                    {
                        status:  1,
                        message: R.text(R.EMAIL_CHANGED, locale)
                    };
                    res.json(data);
                }
                else
                {
                    // メールアドレス設定の確認画面でメールアドレスの設定を完了させた後、再度メールアドレスの設定を完了させようとした場合にここに到達する想定。
                    // 変更IDで該当するアカウントがないということが必ずしもメールアドレスの設定済みを意味するわけではないが、
                    // 第三者が直接このAPIをコールするなど、想定以外のケースでなければありえないので変更済みというメッセージでOK。
                    res.ext.error(Response.Status.FAILED, R.text(R.ALREADY_EMAIL_CHANGED, locale));
                }
            }
            while (false);
            log.stepOut();
        }
        catch (err) {Utils.internalServerError(err, res, log)};
    }

    /**
     * パスワードを変更する<br>
     * PUT /api/settings/account/password
     */
    static async onChangePassword(req : express.Request, res : express.Response)
    {
        const log = slog.stepIn(SettingsApi.CLS_NAME, 'onChangePassword');
        try
        {
            do
            {
                const locale = req.ext.locale;
                const param     : Request.ChangePassword = req.body;
                const condition : Request.ChangePassword =
                {
                    oldPassword: ['string', null, true],
                    newPassword: ['string', null, true],
                    confirm:     ['string', null, true]
                }

                if (Utils.existsParameters(param, condition) === false)
                {
                    res.ext.badRequest(locale);
                    break;
                }

                const oldPassword = <string>param.oldPassword;
                const newPassword = <string>param.newPassword;
                const confirm =     <string>param.confirm;

                const session : Session = req.ext.session;
                const account = await AccountModel.find(session.account_id);

                if (account.email === null)
                {
                    res.ext.error(Response.Status.FAILED, R.text(R.CANNOT_SET_PASSWORD, locale));
                    break;
                }

                if (account.password !== null || param.oldPassword !== '')
                {
                    const hashPassword = Utils.getHashPassword(account.email, oldPassword, Config.PASSWORD_SALT);

                    if (hashPassword !== account.password)
                    {
                        res.ext.error(Response.Status.FAILED, R.text(R.INVALID_PASSWORD, locale));
                        break;
                    }
                }

                if (Utils.validatePassword(newPassword) === false)
                {
                    res.ext.error(Response.Status.FAILED, R.text(R.PASSWORD_TOO_SHORT_OR_TOO_LONG, locale));
                    break;
                }

                if (param.newPassword !== confirm)
                {
                    res.ext.error(Response.Status.FAILED, R.text(R.MISMATCH_PASSWORD, locale));
                    break;
                }

                account.password = Utils.getHashPassword(account.email, param.newPassword, Config.PASSWORD_SALT);
                await AccountModel.update(account);

                const data : Response.ChangePassword =
                {
                    status:  1,
                    message: R.text(R.PASSWORD_CHANGED, locale)
                };
                res.json(data);
            }
            while (false);
            log.stepOut();
        }
        catch (err) {Utils.internalServerError(err, res, log)};
    }

    /**
     * アカウント削除<br>
     * DELETE /api/settings/account
     */
    static async onDeleteAccount(req : express.Request, res : express.Response)
    {
        const log = slog.stepIn(SettingsApi.CLS_NAME, 'onDeleteAccount');
        try
        {
            const session : Session = req.ext.session;
            const accountId = session.account_id;
            const account = await AccountModel.find(accountId);

            await DeleteAccountModel.add(account);
            await AccountModel.remove( accountId);
            await SessionModel.logout({accountId});

//          req.logout();

            const data : Response.DeleteAccount = {status:0};
            res.json(data);
            log.stepOut();
        }
        catch (err) {Utils.internalServerError(err, res, log)};
    }
}
