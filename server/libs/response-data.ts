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
     * OKレスポンス
     *
     * @param   status  ステータス
     * @param   message メッセージ
     */
    static ok(status : number, message? : string) : any
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
