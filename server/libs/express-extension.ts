/**
 * (C) 2016-2017 printf.jp
 */
import express = require('express');
import slog =    require('../slog');

export function expressExtention(req : express.Request, res : express.Response, next : express.NextFunction) : void
{
    res.ext =
    {
        ok:    ok.   bind(res),
        error: error.bind(res)
    };

    next();
}

/**
 * OKレスポンス
 *
 * @param   status  ステータス
 * @param   message メッセージ
 */
function ok(status : number, message? : string) : void
{
    const log = slog.stepIn('express-extension', 'ok');
    const self : express.Response = this;
    const data = {status, message};

    self.json(data);

    log.d(JSON.stringify(data, null, 2));
    log.stepOut();
}

/**
 * エラーレスポンス
 *
 * @param   status  ステータス
 * @param   message メッセージ
 */
function error(status : number, message : string) : any
{
    const log = slog.stepIn('express-extension', 'error');
    const self : express.Response = this;
    const data = {status, message};

    if (status < 0)
        self.status(400);

    self.json(data);

    log.w(JSON.stringify(data, null, 2));
    log.stepOut();
}
