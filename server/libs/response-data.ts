/**
 * (C) 2016 printf.jp
 */
import slog = require('../slog');

/**
 * レスポンスデータ
 */
export default class ResponseData
{
    private static CLS_NAME = 'ResponseData';

    /**
     * 認証レスポンス
     *
     * @param   provider    プロバイダ名
     */
    static auth(provider : string) : any
    {
        const data = ResponseData.redirect(`/auth/${provider}`);
        return data;
    }

    /**
     * リダイレクトレスポンス
     *
     * @param   redirect    リダイレクト先URL
     */
    static redirect(redirect : string) : any
    {
        const log = slog.stepIn(ResponseData.CLS_NAME, 'redirect');
        const data =
        {
            status: 0,
            redirect: redirect
        };

        log.d(JSON.stringify(data, null, 2));
        log.stepOut();
        return data;
    }

    /**
     * OKレスポンス
     *
     * @param   status  ステータス
     * @param   message メッセージ
     */
    static ok(status : number, message : string) : any
    {
        const log = slog.stepIn(ResponseData.CLS_NAME, 'ok');
        const data =
        {
            status: status,
            message: message
        };

        log.d(JSON.stringify(data, null, 2));
        log.stepOut();
        return data;
    }

    /**
     * エラーレスポンス
     *
     * @param   status  ステータス
     * @param   message メッセージ
     */
    static error(status : number, message : string) : any
    {
        const log = slog.stepIn(ResponseData.CLS_NAME, 'error');
        const data =
        {
            status: status,
            message: message
        };

        log.d(JSON.stringify(data, null, 2));
        log.stepOut();
        return data;
    }
}
