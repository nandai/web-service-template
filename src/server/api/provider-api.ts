/**
 * (C) 2016-2017 printf.jp
 */
import {Request}  from 'libs/request';
import {Response} from 'libs/response';
import R          from '../libs/r';
import Utils      from '../libs/utils';
import Facebook   from '../provider/facebook';
import Github     from '../provider/github';
import Google     from '../provider/google';
import Twitter    from '../provider/twitter';

import express = require('express');
import slog =    require('../slog');

/**
 * ログインAPI
 */
export default class ProviderApi
{
    private static CLS_NAME = 'ProviderApi';

    /**
     * サインアップ、またはログインする<br>
     * POST /api/{command}/:provider
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
            case 'github':   fn = ProviderApi.github;   break;
            default:
                // ルートパスの正規表現に誤りがない限りここに到達することはない
                log.e('無効なプロバイダ');
                break;
        }

        if (fn) {
            fn(req, res, command);
        }

        log.stepOut();
    }

    /**
     * Twitterでサインアップ、ログイン、または紐づけをする<br>
     * POST /api/login/twitter
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
            const locale = req.ext.locale;
            const param     : Request.Twitter = req.body;
            const condition : Request.Twitter =
            {
                accessToken:       ['string', null, true],
                accessTokenSecret: ['string', null, true]
            };

            if (Utils.existsParameters(param, condition) === false)
            {
                res.ext.badRequest(locale);
                break;
            }

            const accessToken  =      <string>param.accessToken;
            const accessTokenSecret = <string>param.accessTokenSecret;

            process.nextTick(() =>
            {
                Twitter.verify(accessToken, accessTokenSecret, undefined, (err, user) =>
                {
                    req.ext.command = command;
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
     * POST /api/login/facebook
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
            const locale = req.ext.locale;
            const param     : Request.Facebook = req.body;
            const condition : Request.Facebook =
            {
                accessToken: ['string', null, true]
            };

            if (Utils.existsParameters(param, condition) === false)
            {
                res.ext.badRequest(locale);
                break;
            }

            const accessToken = <string>param.accessToken;
            process.nextTick(() =>
            {
                Facebook.verify(accessToken, undefined, undefined, (err, user) =>
                {
                    req.ext.command = command;
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
     * POST /api/login/google
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
            const locale = req.ext.locale;
            const param     : Request.Google = req.body;
            const condition : Request.Google =
            {
                accessToken: ['string', null, true]
            };

            if (Utils.existsParameters(param, condition) === false)
            {
                res.ext.badRequest(locale);
                break;
            }

            const accessToken = <string>param.accessToken;
            process.nextTick(() =>
            {
                Google.verify(accessToken, undefined, undefined, (err, user) =>
                {
                    req.ext.command = command;
                    req.user = user;
                    Google.callback(req, res);
                });
            });
        }
        while (false);
        log.stepOut();
    }

    /**
     * Githubでサインアップ、ログイン、または紐づけをする<br>
     * POST /api/login/google
     *
     * @param   req     httpリクエスト
     * @param   res     httpレスポンス
     * @param   command コマンド（'signup', 'login', 'link'）
     */
    private static github(req : express.Request, res : express.Response, command : string) : void
    {
        const log = slog.stepIn(ProviderApi.CLS_NAME, 'github');
        do
        {
            const locale = req.ext.locale;
            const param     : Request.Github = req.body;
            const condition : Request.Github =
            {
                accessToken: ['string', null, true]
            };

            if (Utils.existsParameters(param, condition) === false)
            {
                res.ext.badRequest(locale);
                break;
            }

            const accessToken = <string>param.accessToken;
            process.nextTick(() =>
            {
                Github.verify(accessToken, undefined, undefined, (err, user) =>
                {
                    req.ext.command = command;
                    req.user = user;
                    Github.callback(req, res);
                });
            });
        }
        while (false);
        log.stepOut();
    }
}
