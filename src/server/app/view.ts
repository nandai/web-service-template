/**
 * (C) 2016-2017 printf.jp
 */
import ClientR from 'client/libs/r';

import express = require('express');

export function view(title : string, js : string, contents = '', store = {}) : string
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

    <link  href="/components/wst.css" rel="stylesheet" />
    <script src="/js/${js}"></script>
</head>

<body ontouchstart="">
    <div id="root">${contents}</div>
</body>
</html>
    `;

    return html;
}

export function forbidden(req : express.Request, res : express.Response) : void
{
    const locale = req.ext.locale;
    const title = ClientR.text(ClientR.FORBIDDEN, locale);
    res.status(403).send(view(title, 'wst.js'));
}

export function notFound(req : express.Request, res : express.Response) : void
{
    const locale = req.ext.locale;
    const title = ClientR.text(ClientR.NOT_FOUND, locale);
    res.status(404).send(view(title, 'wst.js'));
}
