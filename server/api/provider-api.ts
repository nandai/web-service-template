/**
 * (C) 2016 printf.jp
 */
import R            from '../libs/r';
import Utils        from '../libs/utils';
import ResponseData from '../libs/response-data';
import Twitter      from '../provider/twitter';
import Facebook     from '../provider/facebook';
import Google       from '../provider/google';

import express = require('express');
import slog =    require('../slog');

/**
 * ログインAPI
 */
export default class ProviderApi
{
    private static CLS_NAME = 'ProviderApi';

    /**
     * ログインする<br>
     * POST /api/{command}/:provider<br>
     *
     * <table>
     * <tr><td>accessToken</td>
     *     <td>アクセストークン</td></tr>
     *
     * <tr><td>accessTokenSecret</td>
     *     <td>アクセストークンシークレット。Twitterのみ</td></tr>
     * </table>
     *
     * @param   req     httpリクエスト
     * @param   res     httpレスポンス
     * @param   command コマンド（'signup', 'login', 'link'）
     */
    protected static provider(req : express.Request, res : express.Response, command : string) : void
    {
        const log = slog.stepIn(ProviderApi.CLS_NAME, 'provider');
        const provider = req.params.provider;
        let fn : (req : express.Request, res : express.Response, command : string) => void = null;

        log.d(`provider:${provider}, command:${command}`);

        switch (provider)
        {
            case 'twitter':  fn = ProviderApi.twitter;  break;
            case 'facebook': fn = ProviderApi.facebook; break;
            case 'google':   fn = ProviderApi.google;   break;
            default:
                // ルートパスの正規表現に誤りがない限りここに到達することはない
                log.e('無効なプロバイダ');
                break;
        }

        if (fn)
            fn(req, res, command);

        log.stepOut();
    }

    /**
     * Twitterでサインアップ、ログイン、または紐づけをする<br>
     * POST /api/login/twitter<br>
     *
     * <table>
     * <tr><td>accessToken</td>
     *     <td>アクセストークン</td></tr>
     *
     * <tr><td>accessTokenSecret</td>
     *     <td>アクセストークンシークレット</td></tr>
     * </table>
     *
     * @param   req     httpリクエスト
     * @param   res     httpレスポンス
     * @param   command コマンド（'signup', 'login', 'link'）
     */
    private static twitter(req : express.Request, res : express.Response, command : string) : void
    {
        const log = slog.stepIn(ProviderApi.CLS_NAME, 'twitter');
        do
        {
            const locale : string = req['locale'];
            const param = req.body;
            const condition =
            {
                accessToken:       ['string', null, true],
                accessTokenSecret: ['string', null, true]
            }

            if (Utils.existsParameters(param, condition) === false)
            {
                const data = ResponseData.error(-1, R.text(R.BAD_REQUEST, locale));
                res.status(400).json(data);
                break;
            }

            const accessToken       : string = param.accessToken;
            const accessTokenSecret : string = param.accessTokenSecret;
            process.nextTick(() =>
            {
                Twitter.verify(accessToken, accessTokenSecret, undefined, (err, user) =>
                {
                    req['command'] = command;
                    req.user = user;
                    Twitter.callback(req, res);
                });
            });
        }
        while (false);
        log.stepOut();
    }

    /**
     * Facebookでサインアップ、ログイン、または紐づけをする<br>
     * POST /api/login/facebook<br>
     *
     * <table>
     * <tr><td>accessToken</td>
     *     <td>アクセストークン</td></tr>
     * </table>
     *
     * @param   req     httpリクエスト
     * @param   res     httpレスポンス
     * @param   command コマンド（'signup', 'login', 'link'）
     */
    private static facebook(req : express.Request, res : express.Response, command : string) : void
    {
        const log = slog.stepIn(ProviderApi.CLS_NAME, 'facebook');
        do
        {
            const locale : string = req['locale'];
            const param = req.body;
            const condition =
            {
                accessToken: ['string', null, true]
            }

            if (Utils.existsParameters(param, condition) === false)
            {
                const data = ResponseData.error(-1, R.text(R.BAD_REQUEST, locale));
                res.status(400).json(data);
                break;
            }

            const accessToken : string = param.accessToken;
            process.nextTick(() =>
            {
                Facebook.verify(accessToken, undefined, undefined, (err, user) =>
                {
                    req['command'] = command;
                    req.user = user;
                    Facebook.callback(req, res);
                });
            });
        }
        while (false);
        log.stepOut();
    }

    /**
     * Googleでサインアップ、ログイン、または紐づけをする<br>
     * POST /api/login/google<br>
     *
     * <table>
     * <tr><td>accessToken</td>
     *     <td>アクセストークン</td></tr>
     * </table>
     *
     * @param   req     httpリクエスト
     * @param   res     httpレスポンス
     * @param   command コマンド（'signup', 'login', 'link'）
     */
    private static google(req : express.Request, res : express.Response, command : string) : void
    {
        const log = slog.stepIn(ProviderApi.CLS_NAME, 'google');
        do
        {
            const locale : string = req['locale'];
            const param = req.body;
            const condition =
            {
                accessToken: ['string', null, true]
            }

            if (Utils.existsParameters(param, condition) === false)
            {
                const data = ResponseData.error(-1, R.text(R.BAD_REQUEST, locale));
                res.status(400).json(data);
                break;
            }

            const accessToken : string = param.accessToken;
            process.nextTick(() =>
            {
                Google.verify(accessToken, undefined, undefined, (err, user) =>
                {
                    req['command'] = command;
                    req.user = user;
                    Google.callback(req, res);
                });
            });
        }
        while (false);
        log.stepOut();
    }
}
