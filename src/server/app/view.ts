/**
 * (C) 2016-2017 printf.jp
 */
import ClientR     from 'client/libs/r';
import SettingsApi from 'server/api/settings-api';

import express = require('express');

/**
 * view
 */
export function view(title : string, js : string, contents : string, store) : string
{
    // NOTE:<body ontouchstart="">はスマホでタッチした時に:activeを効かせるための設定
    const html = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no">
    <title>${title}</title>

    <script>
        var ssrStore = ${JSON.stringify(store)};
    </script>

    <link  href="/wst.css" rel="stylesheet" />
    <script src="/${js}"></script>
</head>

<body ontouchstart="">
    <div id="root">${contents}</div>
</body>
</html>
    `;

    return html;
}

/**
 * forbidden
 */
export function forbidden(req : express.Request, res : express.Response)
{
    return sendAbnormal(req, res, ClientR.FORBIDDEN, 403);
}

/**
 * notFound
 */
export function notFound(req : express.Request, res : express.Response)
{
    return sendAbnormal(req, res, ClientR.NOT_FOUND, 404);
}

/**
 * 異常レスポンス送信
 */
function sendAbnormal(req : express.Request, res : express.Response, phrase : string, status : number)
{
    return new Promise(async (resolve : () => void, reject) =>
    {
        try
        {
            const locale = req.ext.locale;
            const title = ClientR.text(phrase, locale);
            const data = await SettingsApi.getAccount(req);
            const {account} = data;
            res.status(status).send(view(title, 'wst.js', '', {locale, account}));
            resolve();
        }
        catch (err) {reject(err);}
    });
}
