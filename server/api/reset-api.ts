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
     * @param   {express.Request}   req httpリクエスト
     * @param   {express.Response}  res httpレスポンス
     */
    static index(req : express.Request, res : express.Response) : void
    {
        const log = slog.stepIn(ResetApi.CLS_NAME, 'index');
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

                const account : Account = yield AccountModel.findByProviderId('email', param.email);
                if (account === null)
                {
                    const data = ResponseData.error(-1, R.text(R.INVALID_EMAIL));
                    res.json(data);
                    break;
                }

                account.reset_id = Utils.createRundomText(32);
                yield AccountModel.update(account);

                const url = Utils.generateUrl('reset', account.reset_id);
                const result = yield Utils.sendMail('パスワードリセットのお知らせ', account.email, `パスワードリセット。\n${url}`);
                const data =
                {
                    status: 1,
                    message: R.text(result ? R.RESET_MAIL_SENDED : R.COULD_NOT_SEND_RESET_MAIL)
                };
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
     * @param   {express.Request}   req httpリクエスト
     * @param   {express.Response}  res httpレスポンス
     */
    static change(req : express.Request, res : express.Response) : void
    {
        const log = slog.stepIn(ResetApi.CLS_NAME, 'change');
        co(function* ()
        {
            do
            {
                const param = req.body;
                const condition =
                {
                    id:       ['string', null, true],
                    password: ['string', null, true],
                    confirm:  ['string', null, true]
                }

                if (Utils.existsParameters(param, condition) === false)
                {
                    const data = ResponseData.error(-1, R.text(R.BAD_REQUEST));
                    res.status(400).json(data);
                    break;
                }

                if (Utils.validatePassword(param.password) === false)
                {
                    const data = ResponseData.error(-1, R.text(R.PASSWORD_TOO_SHORT_OR_TOO_LONG));
                    res.json(data);
                    break;
                }

                if (param.password !== param.confirm)
                {
                    const data = ResponseData.error(-1, R.text(R.MISMATCH_PASSWORD));
                    res.json(data);
                    break;
                }

                const resetId = param.id;
                const account : Account = yield AccountModel.findByResetId(resetId);

                if (account)
                {
                    account.password = Utils.getHashPassword(account.email, param.password, Config.PASSWORD_SALT);
                    account.reset_id = null;
                    yield AccountModel.update(account);

                    const data =
                    {
                        status: 1,
                        message: R.text(R.PASSWORD_RESET)
                    };
                    res.json(data);
                }
                else
                {
                    // パスワードリセットの画面でパスワードリセットを完了させた後、再度パスワードリセットを完了させようとした場合にここに到達する想定。
                    // リセットIDで該当するアカウントがないということが必ずしもパスワードリセット済みを意味するわけではないが、
                    // 第三者が直接このAPIをコールするなど、想定以外のケースでなければありえないので、パスワードリセット済みというメッセージでOK。
                    const data = ResponseData.error(-1, R.text(R.ALREADY_PASSWORD_RESET));
                    res.json(data);
                }
            }
            while (false);
            log.stepOut();
        })
        .catch ((err) => Utils.internalServerError(err, res, log));
    }
}
