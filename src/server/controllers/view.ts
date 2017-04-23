/**
 * (C) 2016-2017 printf.jp
 */
import ClientR from 'client/libs/r';

import express = require('express');

export function view(title : string, js : string, contents = '', store = {}) : string
{
    // NOTE:<body ontouchstart="">はスマホでタッチした時に:activeを効かせるための設定
    const view = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no">
    <title>${title}</title>

    <!-- デバッグログ -->
    <script src="/components/slog.js"></script>
    <script>
//      var serviceAddr = (('https:' === document.location.protocol) ? 'wss://localhost:8443' : 'ws://localhost:8080');
        var serviceAddr = 'ws://localhost:8080';
        slog.setConfig(serviceAddr, 'webServiceTemplate.log', 'ALL');
        var ssrStore = ${JSON.stringify(store)};
    </script>

    <link  href="/components/wst.css" rel="stylesheet" />
    <script src="/js/${js}"></script>
</head>

<body ontouchstart="">
    <div id="root">${contents}</div>
</body>
</html>
    `;

    return view;
}

export function notFound(req : express.Request, res : express.Response) : void
{
    const locale = req.ext.locale;
    const title = ClientR.text(ClientR.NOT_FOUND, locale);
    res.status(404).send(view(title, 'wst.js'));
}
