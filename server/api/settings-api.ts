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
const co =       require('co');
const slog =     require('../slog');

/**
 * 設定API
 */
export default class SettingsApi
{
    private static CLS_NAME = 'SettingsApi';

    /**
     * @param   {express.Request}   req httpリクエスト
     * @param   {express.Response}  res httpレスポンス
     */
    static account(req : express.Request, res : express.Response) : void
    {
        co(function* ()
        {
            const log = slog.stepIn(SettingsApi.CLS_NAME, 'account');
            const session : Session = req['sessionObj'];
            const account : Account = yield AccountModel.find(session.account_id);
            const data =
            {
                status: 0,
                name:      account.name,
                twitter:  (account.twitter  !== null),
                facebook: (account.facebook !== null),
                google:   (account.google   !== null)
            };

            res.json(data);
            log.stepOut();
        });
    }

    /**
     * @param   {express.Request}   req httpリクエスト
     * @param   {express.Response}  res httpレスポンス
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

                const session : Session = req['sessionObj'];
                const account : Account = yield AccountModel.find(session.account_id);
                account.change_id = Utils.createRundomText(32);
                account.change_email = param.email;
                yield AccountModel.update(account);

                const url = Utils.generateUrl('settings/account/email/change', account.change_id);
                const result = yield Utils.sendMail('メールアドレス変更手続きのお知らせ', account.change_email, `メールアドレス変更手続き。\n${url}`);
                const data =
                {
                    status: 1,
                    message: (result ? 'メールアドレス変更手続きのメールを送信しました。' : 'メールアドレス変更手続きのメールを送信できませんでした。')
                };
                res.json(data);
            }
            while (false);
            log.stepOut();
        })
        .catch ((err) => Utils.internalServerError(err, res, log));
    }

    /**
     * @param   {express.Request}   req httpリクエスト
     * @param   {express.Response}  res httpレスポンス
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
                    const hashPassword = Utils.getHashPassword(account.email, param.password, Config.PASSWORD_SALT);

                    if (hashPassword !== account.password)
                    {
                        const data = ResponseData.error(-1, 'パスワードが正しくありません。');
                        res.json(data);
                        break;
                    }

                    account.email = account.change_email;
                    account.password = Utils.getHashPassword(account.change_email, param.password, Config.PASSWORD_SALT);
                    account.change_id = null;
                    account.change_email = null;
                    yield AccountModel.update(account);

                    const data =
                    {
                        status: 1,
                        message: 'メールアドレスを変更しました。'
                    };
                    res.json(data);
                }
                else
                {
                    const data = ResponseData.error(-1, 'メールアドレスは変更済みです。');
                    res.json(data);
                }
            }
            while (false);
            log.stepOut();
        })
        .catch ((err) => Utils.internalServerError(err, res, log));
    }

    /**
     * @param   {express.Request}   req httpリクエスト
     * @param   {express.Response}  res httpレスポンス
     */
    static linkTwitter(req : express.Request, res : express.Response) : void
    {
//      const log = slog.stepIn(SettingsApi.CLS_NAME, 'linkTwitter');
        SettingsApi.sendResponse(req, res, 'twitter');
//      log.stepOut();
    }

    /**
     * @param   {express.Request}   req httpリクエスト
     * @param   {express.Response}  res httpレスポンス
     */
    static linkFacebook(req : express.Request, res : express.Response) : void
    {
        SettingsApi.sendResponse(req, res, 'facebook');
    }

    /**
     * @param   {express.Request}   req httpリクエスト
     * @param   {express.Response}  res httpレスポンス
     */
    static linkGoogle(req : express.Request, res : express.Response) : void
    {
        SettingsApi.sendResponse(req, res, 'google');
    }

    /**
     * @param   {express.Request}   req         httpリクエスト
     * @param   {express.Response}  res         httpレスポンス
     * @param   {string}            provider    プロバイダ名
     */
    private static sendResponse(req : express.Request, res : express.Response, provider : string) : void
    {
        const cookie = new Cookie(req, res);
        cookie.command = 'link';

        const data = ResponseData.auth(provider);
        res.json(data);
    }

    /**
     * @param   {express.Request}   req httpリクエスト
     * @param   {express.Response}  res httpレスポンス
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
