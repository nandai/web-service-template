/**
 * (C) 2016-2017 printf.jp
 */
import * as React    from 'react';
import * as ReactDOM from 'react-dom/server';

import {App}         from 'client/app/app';
import Root          from 'client/components/root';
import {BaseStore}   from 'client/components/views/base-store';
import {pageNS}      from 'client/libs/page';
import MainApp       from 'client/main/main-app';
import {slog}        from 'libs/slog';
import SettingsApi   from 'server/api/settings-api';
import Config        from 'server/config';

import express = require('express');
import fs =      require('fs');
import path =    require('path');

let css : string = '';
const mainApp = new MainApp();

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
 * App生成
 */
function createApp(store : BaseStore, hasQuery : boolean) : App
{
    const log = slog.stepIn('view.tsx', 'createApp');
    const routeResult = mainApp.getRoute(store.currentUrl, store.account, hasQuery);
    const app = routeResult.rootApp.factory(store);

    app.display();
    log.stepOut();
    return app;
}

/**
 * view
 */
export function view(req : express.Request, store : BaseStore = {}, options : {url? : string} = {}) : string
{
    const log = slog.stepIn('view.tsx', 'view');
    store.locale = req.ext.locale;
    store.currentUrl = options.url || req.path;

    const app = createApp(store, Object.keys(req.query).length > 0);
    const js = 'wst.js';
    const contents = ReactDOM.renderToString(<Root app={app} />);
    const deepestApp = app.findApp(store.currentUrl) || app;
    const title = deepestApp.title;

    // NOTE:<body ontouchstart="">はスマホでタッチした時に:activeを効かせるための設定
    const html = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no">
    <title>${title}</title>

    <script>
        var ssrStore = ${JSON.stringify(deepestApp.store)};
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

    log.stepOut();
    return html;
}

/**
 * forbidden
 */
export function forbidden(req : express.Request, res : express.Response)
{
    return sendAbnormal(req, res, 403);
}

/**
 * notFound
 */
export function notFound(req : express.Request, res : express.Response)
{
    return sendAbnormal(req, res, 404);
}

/**
 * 異常レスポンス送信
 */
function sendAbnormal(
    req    : express.Request,
    res    : express.Response,
    status : number)
{
    const log = slog.stepIn('view.tsx', 'sendAbnormal');
    return new Promise(async (resolve : () => void, reject) =>
    {
        try
        {
            const data = await SettingsApi.getAccount(req);
            const {account} = data;
            const page : pageNS.Page = {active:true, displayStatus:'displayed'};
            const store : BaseStore = {account, page};

            res.status(status).send(view(req, store, {url:status.toString()}));
            log.stepOut();
            resolve();
        }
        catch (err) {log.stepOut(); reject(err);}
    });
}
