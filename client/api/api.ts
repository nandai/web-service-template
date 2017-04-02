/**
 * (C) 2016-2017 printf.jp
 */
import R          from '../libs/r';
import {Request}  from 'libs/request';
import {Response} from 'libs/response';

import request = require('superagent');
const slog = window['slog'];

export default class Api
{
    private static CLS_NAME = 'Api';

    /**
     * GETリクエストを送信する
     *
     * @param   url         送信先URL
     * @param   param       パラメータ
     * @param   reject      レスポンスでエラーがあった場合のコールバック
     * @param   onSuccess   レスポンスが正常だった場合のコールバック
     */
    protected static sendGetRequest(
        url         : string,
        param       : Object,
        reject      : (data : {message : string}) => void,
        onSuccess   : (data) => void) : void
    {
        request
            .get(url)
            .query(param)
            .end((err, res : request.Response) =>
            {
                if (Api.rejectIfError(err, res, reject, url))
                    return;

                const data = res.body;
                onSuccess(data);
            });
    }

    /**
     * POSTリクエストを送信する
     *
     * @param   url         送信先URL
     * @param   param       パラメータ
     * @param   reject      レスポンスでエラーがあった場合のコールバック
     * @param   onSuccess   レスポンスが正常だった場合のコールバック
     * @param   onProgress  送信進捗コールバック
     */
    protected static sendPostRequest(
        url         : string,
        param       : Object,
        reject      : (data : {message : string}) => void,
        onSuccess   : (data) => void,
        onProgress? : (percent : number) => void) : void
    {
        request
            .post(url)
            .on('progress', (e) =>
            {
                if (onProgress)
                    onProgress(e.percent);
            })
            .send(param)
            .end((err, res : request.Response) =>
            {
                if (Api.rejectIfError(err, res, reject, url))
                    return;

                const data = res.body;
                onSuccess(data);
            });
    }

    /**
     * PUTリクエストを送信する
     *
     * @param   url         送信先URL
     * @param   param       パラメータ
     * @param   reject      レスポンスでエラーがあった場合のコールバック
     * @param   onSuccess   レスポンスが正常だった場合のコールバック
     * @param   onProgress  送信進捗コールバック
     */
    protected static sendPutRequest(
        url         : string,
        param       : Object,
        reject      : (data : {message : string}) => void,
        onSuccess   : (data) => void,
        onProgress? : (percent : number) => void) : void
    {
        request
            .put(url)
            .on('progress', (e) =>
            {
                if (onProgress)
                    onProgress(e.percent);
            })
            .send(param)
            .end((err, res : request.Response) =>
            {
                if (Api.rejectIfError(err, res, reject, url))
                    return;

                const data = res.body;
                onSuccess(data);
            });
    }

    /**
     * DELETEリクエストを送信する
     *
     * @param   url         送信先URL
     * @param   param       パラメータ
     * @param   reject      レスポンスでエラーがあった場合のコールバック
     * @param   onSuccess   レスポンスが正常だった場合のコールバック
     */
    protected static sendDeleteRequest(
        url         : string,
        param       : Object,
        reject      : (data : {message : string}) => void,
        onSuccess   : (data) => void) : void
    {
        request
            .del(url)
            .query(param)
            .end((err, res : request.Response) =>
            {
                if (Api.rejectIfError(err, res, reject, url))
                    return;

                const data = res.body;
                onSuccess(data);
            });
    }

    /**
     * APIのレスポンスにエラーがあればリジェクト
     *
     * @param   err     エラー
     * @param   res     レスポンス
     * @param   reject  レスポンスでエラーがあった場合のコールバック
     * @param   url     送信先URL（デバッグ時の調査用）
     *
     * @return  エラーがあればtrueを返す
     */
    private static rejectIfError(
        err,
        res    : request.Response,
        reject : (data : {message : string}) => void,
        url    : string) : boolean
    {
        let data = {message:'Unknown error.'};
        let hasError = true;

        do
        {
            if (! res)
            {
                if (! err)
                {
                    console.error('no response data.');
                    break;
                }

                if (! err.crossDomain)
                {
                    console.error(`status:${err.status}, message:${err.message}`);
                    break;
                }

                // 未接続時は以下のエラーメッセージで、crossDomainはtrueとなっているが別にクロスドメインでエラーになっているわけではない...
                //
                // 原文：the network is offline, Origin is not allowed by Access-Control-Allow-Origin, the page is being unloaded, etc.
                // 翻訳：ネットワークがオフラインで、OriginがAccess-Control-Allow-Originによって許可されていない、ページがアンロード中など
                data.message = R.text(R.ERROR_NETWORK);
                break;
            }

            if (res.status !== 200)
            {
                data = res.body;
                break;
            }

            hasError = false;
        }
        while (false);

        if (hasError)
            reject(data);

        return hasError;
    }
}
