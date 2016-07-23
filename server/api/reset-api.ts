/**
 * (C) 2016 printf.jp
 */
import Config       from '../config';
import R            from '../libs/r';
import Utils        from '../libs/utils';
import ResponseData from '../libs/response-data';
import AccountModel, {Account} from '../models/account-model';

import express = require('express');
import slog =    require('../slog');
const co =       require('co');

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
    static index(req : express.Request, res : express.Response) : void
    {
        const log = slog.stepIn(ResetApi.CLS_NAME, 'index');
        co(function* ()
        {
            do
            {
                const locale : string = req['locale'];
                const param = req.body;
                const condition =
                {
                    email: ['string', null, true]
                }

                if (Utils.existsParameters(param, condition) === false)
                {
                    const data = ResponseData.error(-1, R.text(R.BAD_REQUEST, locale));
                    res.status(400).json(data);
                    break;
                }

                const account : Account = yield AccountModel.findByProviderId('email', param.email);
                if (account === null || account.signup_id)
                {
                    const data = ResponseData.error(-1, R.text(R.INVALID_EMAIL, locale));
                    res.json(data);
                    break;
                }

                account.reset_id = Utils.createRundomText(32);
                yield AccountModel.update(account);

                const url = Utils.generateUrl('reset', account.reset_id);
                const template = R.mail(R.NOTICE_RESET_PASSWORD, locale);
                const contents = Utils.formatString(template.contents, {url});
                const result = yield Utils.sendMail(template.subject, account.email, contents);
                const data = ResponseData.ok(1, R.text(result ? R.RESET_MAIL_SENDED : R.COULD_NOT_SEND_RESET_MAIL, locale));
                res.json(data);
            }
            while (false);
            log.stepOut();
        })
        .catch ((err) => Utils.internalServerError(err, res, log));
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
    static change(req : express.Request, res : express.Response) : void
    {
        const log = slog.stepIn(ResetApi.CLS_NAME, 'change');
        co(function* ()
        {
            do
            {
                const locale : string = req['locale'];
                const param = req.body;
                const condition =
                {
                    reset_id: ['string', null, true],
                    password: ['string', null, true],
                    confirm:  ['string', null, true]
                }

                if (Utils.existsParameters(param, condition) === false)
                {
                    const data = ResponseData.error(-1, R.text(R.BAD_REQUEST, locale));
                    res.status(400).json(data);
                    break;
                }

                if (Utils.validatePassword(param.password) === false)
                {
                    const data = ResponseData.error(-1, R.text(R.PASSWORD_TOO_SHORT_OR_TOO_LONG, locale));
                    res.json(data);
                    break;
                }

                if (param.password !== param.confirm)
                {
                    const data = ResponseData.error(-1, R.text(R.MISMATCH_PASSWORD, locale));
                    res.json(data);
                    break;
                }

                const resetId = param.reset_id;
                const account : Account = yield AccountModel.findByResetId(resetId);

                if (account)
                {
                    account.password = Utils.getHashPassword(account.email, param.password, Config.PASSWORD_SALT);
                    account.reset_id = null;
                    yield AccountModel.update(account);

                    const data = ResponseData.ok(1, R.text(R.PASSWORD_RESET, locale));
                    res.json(data);
                }
                else
                {
                    // パスワードリセットの画面でパスワードリセットを完了させた後、再度パスワードリセットを完了させようとした場合にここに到達する想定。
                    // リセットIDで該当するアカウントがないということが必ずしもパスワードリセット済みを意味するわけではないが、
                    // 第三者が直接このAPIをコールするなど、想定以外のケースでなければありえないので、パスワードリセット済みというメッセージでOK。
                    const data = ResponseData.error(-1, R.text(R.ALREADY_PASSWORD_RESET, locale));
                    res.json(data);
                }
            }
            while (false);
            log.stepOut();
        })
        .catch ((err) => Utils.internalServerError(err, res, log));
    }
}
