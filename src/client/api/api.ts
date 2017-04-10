/**
 * (C) 2016-2017 printf.jp
 */
import R          from '../libs/r';
import Utils      from '../libs/utils';
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
     * @param   url     送信先URL
     * @param   param   パラメータ
     */
    protected static sendGetRequest(
        url   : string,
        param : Object)
    {
        return new Promise((resolve : (res : {ok:boolean, data}) => void) =>
        {
            request
                .get(url)
                .query(param)
                .end((err, res : request.Response) =>
                {
                    const result = Api.hasError(err, res);
                    resolve(result);
                });
        });
    }

    /**
     * POSTリクエストを送信する
     *
     * @param   url         送信先URL
     * @param   param       パラメータ
     * @param   onProgress  送信進捗コールバック
     */
    protected static sendPostRequest(
        url         : string,
        param       : Object,
        onProgress? : (percent : number) => void)
    {
        return new Promise((resolve : (res : {ok:boolean, data}) => void) =>
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
                    const result = Api.hasError(err, res);
                    resolve(result);
                });
        });
    }

    /**
     * PUTリクエストを送信する
     *
     * @param   url         送信先URL
     * @param   param       パラメータ
     * @param   onProgress  送信進捗コールバック
     */
    protected static sendPutRequest(
        url         : string,
        param       : Object,
        onProgress? : (percent : number) => void)
    {
        return new Promise(async (resolve : (res : {ok:boolean, data}) => void) =>
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
                    const result = Api.hasError(err, res);
                    resolve(result);
                });
        });
    }

    /**
     * DELETEリクエストを送信する
     *
     * @param   url     送信先URL
     * @param   param   パラメータ
     */
    protected static sendDeleteRequest(
        url   : string,
        param : Object)
    {
        return new Promise(async (resolve : (res : {ok:boolean, data}) => void) =>
        {
            request
                .del(url)
                .query(param)
                .end((err, res : request.Response) =>
                {
                    const result = Api.hasError(err, res);
                    resolve(result);
                });
        });
    }

    /**
     * resolve、またはrejectする
     */
    protected static result(ok : boolean, data, resolve, reject)
    {
        if (ok) resolve(data);
        else    reject( data);
    }

    /**
     * APIのレスポンスにエラーがあるかどうか
     *
     * @param   err エラー
     * @param   res レスポンス
     */
    private static hasError(err, res : request.Response) : {ok:boolean, data}
    {
        const locale = Utils.getLocale();
        let ok = false;
        let data = {message:'Unknown error.'};

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
                data.message = R.text(R.ERROR_NETWORK, locale);
                break;
            }

            if (res.body === null)
            {
                data.message = R.text(R.PROBLEM, locale);
                break;
            }

            ok = (res.status === 200);
            data = res.body;
        }
        while (false);
        return {ok, data};
    }
}
