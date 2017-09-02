/**
 * (C) 2016-2017 printf.jp
 */
import * as React    from 'react';
import * as ReactDOM from 'react-dom/server';

import {App}         from 'client/app/app';
import ForbiddenApp  from 'client/app/forbidden-app';
import NotFoundApp   from 'client/app/not-found-app';
import Root          from 'client/components/root';
import {pageNS}      from 'client/libs/page';
import {slog}        from 'libs/slog';
import SettingsApi   from 'server/api/settings-api';
import Config        from 'server/config';

import express = require('express');
import fs =      require('fs');
import path =    require('path');

let css : string = '';

/**
 * cssをロードする
 */
export function loadCss()
{
    const absPath = path.resolve(`${Config.STATIC_DIR}/wst.css`);

    try
    {
        fs.statSync(absPath);
        css = fs.readFileSync(absPath, 'utf8');
    }
    catch (err)
    {
        console.log(`${absPath}が見つかりませんでした。`);
        process.exit();
    }
}

/**
 * view
 */
export function view(app : App, url? : string) : string
{
    // NOTE:<body ontouchstart="">はスマホでタッチした時に:activeを効かせるための設定
    const js = 'wst.js';
    const contents = ReactDOM.renderToString(<Root app={app} />);

    let title = '';
    if (url)     {title = app.getTitle(url);}
    if (! title) {title = app.title;}

    const html = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no">
    <title>${title}</title>

    <script>
        var ssrStore = ${JSON.stringify(app.store)};
    </script>

    <style>
        ${css}
    </style>
</head>

<body ontouchstart="" tabIndex="0">
    <div id="root">${contents}</div>
    <script src="/${js}"></script>
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
    return sendAbnormal(req, res, ForbiddenApp, 403);
}

/**
 * notFound
 */
export function notFound(req : express.Request, res : express.Response)
{
    return sendAbnormal(req, res, NotFoundApp, 404);
}

/**
 * 異常レスポンス送信
 */
function sendAbnormal(
    req       : express.Request,
    res       : express.Response,
    ClientApp : typeof ForbiddenApp | typeof NotFoundApp,
    status    : number)
{
    const log = slog.stepIn('view.tsx', 'sendAbnormal');
    return new Promise(async (resolve : () => void, reject) =>
    {
        try
        {
            const locale = req.ext.locale;
            const data = await SettingsApi.getAccount(req);
            const {account} = data;
            const page : pageNS.Page = {active:true, displayStatus:'displayed'};
            const app = new ClientApp({locale, account, page});
            res.status(status).send(view(app));
            log.stepOut();
            resolve();
        }
        catch (err) {log.stepOut(); reject(err);}
    });
}
