/**
 * (C) 2016-2017 printf.jp
 */
import {Request}    from 'libs/request';
import {Response}   from 'libs/response';
import Config       from 'server/config';
import R            from 'server/libs/r';
import Utils        from 'server/libs/utils';
import AccountModel from 'server/models/account-model';

import express = require('express');
import slog =    require('server/slog');

/**
 * 参加する<br>
 * POST /api/join
 */
export async function onJoin(req : express.Request, res : express.Response)
{
    const log = slog.stepIn('SignupApi', 'onJoin');
    try
    {
        do
        {
            const locale = req.ext.locale;
            const param     : Request.Join = req.body;
            const condition : Request.Join =
            {
                inviteId: ['string', null, true],
                password: ['string', null, true]
            };

            if (Utils.existsParameters(param, condition) === false)
            {
                res.ext.badRequest(locale);
                break;
            }

            const inviteId = <string>param.inviteId;
            const password = <string>param.password;

            if (Utils.validatePassword(password) === false)
            {
                res.ext.error(Response.Status.FAILED, R.text(R.PASSWORD_TOO_SHORT_OR_TOO_LONG, locale));
                break;
            }

            const account = await AccountModel.findByInviteId(inviteId);
            if (account === null)
            {
                // 参加画面で参加を完了させた後、再度参加を完了させようとした場合にここに到達する想定。
                // 招待IDで該当するアカウントがないということが必ずしも参加済みを意味するわけではないが、
                // 第三者が直接このAPIをコールするなど、想定以外のケースでなければありえないので、登録済みというメッセージでOK。
                res.ext.error(Response.Status.FAILED, R.text(R.ALREADY_JOIN, locale));
                break;
            }

            const hashPassword = Utils.getHashPassword(account.email, password, Config.PASSWORD_SALT);

            account.password =  hashPassword;
            account.signup_id = null;
            account.invite_id = null;
            await AccountModel.update(account);

            const data : Response.Join =
            {
                status:  Response.Status.OK,
                message: R.text(R.SIGNUP_COMPLETED, locale)
            };
            res.json(data);
        }
        while (false);
        log.stepOut();
    }
    catch (err) {Utils.internalServerError(err, res, log);}
}
