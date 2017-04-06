/**
 * (C) 2016-2017 printf.jp
 */
import Config                  from '../config';
import R                       from '../libs/r';
import Utils                   from '../libs/utils';
import AccountModel, {Account} from '../models/account-model';
import {Request}               from 'libs/request';
import {Response}              from 'libs/response';

import express = require('express');
import slog =    require('../slog');

/**
 * リセットAPI
 */
export default class ResetApi
{
    private static CLS_NAME = 'ResetApi';

    /**
     * パスワードのリセットを要求する<br>
     * POST /api/reset
     *
     * <table>
     * <tr><td>email</td>
     *     <td>メールアドレス</td></tr>
     * </table>
     *
     * @param   req httpリクエスト
     * @param   res httpレスポンス
     */
    static async requestResetPassword(req : express.Request, res : express.Response)
    {
        const log = slog.stepIn(ResetApi.CLS_NAME, 'index');
        try
        {
            do
            {
                const locale = req.ext.locale;
                const param     : Request.RequestResetPassword = req.body;
                const condition : Request.RequestResetPassword =
                {
                    email: ['string', null, true]
                }

                if (Utils.existsParameters(param, condition) === false)
                {
                    res.ext.error(-1, R.text(R.BAD_REQUEST, locale));
                    break;
                }

                const account = await AccountModel.findByProviderId('email', param.email);
                if (account === null || account.signup_id)
                {
                    res.ext.error(1, R.text(R.INVALID_EMAIL, locale));
                    break;
                }

                account.reset_id = Utils.createRundomText(32);
                await AccountModel.update(account);

                const url = Utils.generateUrl('reset', account.reset_id);
                const template = R.mail(R.NOTICE_RESET_PASSWORD, locale);
                const contents = Utils.formatString(template.contents, {url});
                const result = await Utils.sendMail(template.subject, account.email, contents);

                const data : Response.RequestResetPassword =
                {
                    status:  1,
                    message: R.text(result ? R.RESET_MAIL_SENDED : R.COULD_NOT_SEND_RESET_MAIL, locale)
                };
                res.json(data);
            }
            while (false);
            log.stepOut();
        }
        catch (err) {Utils.internalServerError(err, res, log)};
    }

    /**
     * パスワードをリセットする<br>
     * PUT /api/reset/change
     *
     * <table>
     * <tr><td>reset_id</td>
     *     <td>リセットID</td></tr>
     *
     * <tr><td>password</td>
     *     <td>パスワード</td></tr>
     *
     * <tr><td>confirm</td>
     *     <td>確認のパスワード</td></tr>
     * </table>
     *
     * @param   req httpリクエスト
     * @param   res httpレスポンス
     */
    static async resetPassword(req : express.Request, res : express.Response)
    {
        const log = slog.stepIn(ResetApi.CLS_NAME, 'change');
        try
        {
            do
            {
                const locale = req.ext.locale;
                const param     : Request.ResetPassword = req.body;
                const condition : Request.ResetPassword =
                {
                    resetId:  ['string', null, true],
                    password: ['string', null, true],
                    confirm:  ['string', null, true]
                }

                if (Utils.existsParameters(param, condition) === false)
                {
                    res.ext.error(-1, R.text(R.BAD_REQUEST, locale));
                    break;
                }

                if (Utils.validatePassword(param.password) === false)
                {
                    res.ext.error(1, R.text(R.PASSWORD_TOO_SHORT_OR_TOO_LONG, locale));
                    break;
                }

                if (param.password !== param.confirm)
                {
                    res.ext.error(1, R.text(R.MISMATCH_PASSWORD, locale));
                    break;
                }

                const resetId = param.resetId;
                const account = await AccountModel.findByResetId(resetId);

                if (account)
                {
                    account.password = Utils.getHashPassword(account.email, param.password, Config.PASSWORD_SALT);
                    account.reset_id = null;
                    await AccountModel.update(account);

                    const data : Response.ResetPassword =
                    {
                        status:  1,
                        message: R.text(R.PASSWORD_RESET, locale)
                    };
                    res.json(data);
                }
                else
                {
                    // パスワードリセットの画面でパスワードリセットを完了させた後、再度パスワードリセットを完了させようとした場合にここに到達する想定。
                    // リセットIDで該当するアカウントがないということが必ずしもパスワードリセット済みを意味するわけではないが、
                    // 第三者が直接このAPIをコールするなど、想定以外のケースでなければありえないので、パスワードリセット済みというメッセージでOK。
                    res.ext.error(1, R.text(R.ALREADY_PASSWORD_RESET, locale));
                }
            }
            while (false);
            log.stepOut();
        }
        catch (err) {Utils.internalServerError(err, res, log)};
    }
}
