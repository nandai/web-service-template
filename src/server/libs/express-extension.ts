/**
 * (C) 2016-2017 printf.jp
 */
import {Response} from 'libs/response';
import R          from './r';

import express = require('express');
import slog =    require('../slog');

export function expressExtension(req : express.Request, res : express.Response, next : express.NextFunction) : void
{
    req.ext =
    {
        locale:  null,
        command: null,
        session: null
    };

    res.ext =
    {
//      ok:         ok        .bind(res),
        error:      error     .bind(res),
        badRequest: badRequest.bind(res)
    };

    next();
}

/**
 * OKレスポンス
 *
 * @param   status  ステータス
 * @param   message メッセージ
 */
// function ok(status : number, message? : string) : void
// {
//     const log = slog.stepIn('express-extension', 'ok');
//     const self : express.Response = this;
//     const data = {status, message};
//
//     self.json(data);
//
//     log.d(JSON.stringify(data, null, 2));
//     log.stepOut();
// }

/**
 * エラーレスポンス
 *
 * @param   status  ステータス
 * @param   message メッセージ
 */
function error(status : Response.Status, message : string) : void
{
    sendErrorResponse(this, status, message);
}

/**
 * bad request
 */
function badRequest(locale : string) : void
{
    sendErrorResponse(this, Response.Status.BAD_REQUEST, R.text(R.BAD_REQUEST, locale));
}

/**
 * エラーレスポンス送信
 */
function sendErrorResponse(res : express.Response, status : Response.Status, message : string) : void
{
    const log = slog.stepIn('express-extension', 'sendErrorResponse');
    const data = {status, message};

    if (status === Response.Status.BAD_REQUEST)
    {
        res.status(400);
    }

    res.json(data);

    log.w(JSON.stringify(data, null, 2));
    log.stepOut();
}
