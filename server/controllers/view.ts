/**
 * (C) 2016-2017 printf.jp
 */
export function view(title : string, js : string, message? : string) : string
{
    const optionMessage = (message
        ? `var message = '${message}';`
        : '');

    const view = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no">
    <title>${title}</title>

    <!-- jQuery -->
    <script src="//code.jquery.com/jquery-2.2.0.js"></script>

    <!-- velocity -->
    <script src="/components/velocity.js"></script>

    <!-- デバッグログ -->
    <script src="/components/slog.js"></script>
    <script>
//      var serviceAddr = (('https:' === document.location.protocol) ? 'wss://localhost:8443' : 'ws://localhost:8080');
        var serviceAddr = 'ws://localhost:8080';
        slog.setConfig(serviceAddr, 'webServiceTemplate.log', 'ALL');
        ${optionMessage}
    </script>

    <!-- SulasSplars -->
    <link  href="/components/SulasSplars.css" rel="stylesheet" />
    <script src="/components/SulasSplars.min.js"></script>

    <link  href="/components/app.css" rel="stylesheet" />
    <script src="/js/${js}"></script>
</head>

<body>
    <div id="root"></div>
</body>
</html>
    `;

    return view;
}
