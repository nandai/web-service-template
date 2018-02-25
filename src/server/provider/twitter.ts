/**
 * (C) 2016-2018 printf.jp
 */
import {slog}   from 'libs/slog';
import Config   from 'server/config';
import Utils    from 'server/libs/utils';
import Provider from './provider';

import express =         require('express');
import passportTwitter = require('passport-twitter');
import twit =            require('twit');

/**
 * Twitter
 */
export default class Twitter extends Provider
{
    private static CLS_NAME_2 = 'Twitter';

    /**
     * カスタムコールバック
     */
    static customCallback(req : express.Request, res : express.Response, next : express.NextFunction)
    {
        super._customCallback('twitter', req, res, next);
    }

    /**
     * passportTwitter.Strategyに渡すコールバック
     *
     * @param   accessToken     アクセストークン
     * @param   refreshToken    リフレッシュトークン
     * @param   profile         プロフィール
     * @param   done
     */
    static verify(accessToken : string, refreshToken : string, _profile : passportTwitter.Profile, done) : void
    {
        super._verify('twitter', accessToken, refreshToken, done);
    }

    /**
     * Twitterからのコールバック用
     *
     * @param   req httpリクエスト
     * @param   res httpレスポンス
     */
    static async callback(req : express.Request, res : express.Response)
    {
        const log = slog.stepIn(Twitter.CLS_NAME_2, 'callback');
        try
        {
            const twitter = new Twitter();
            await twitter.signupOrLogin(req, res);
            log.stepOut();
        }
        catch (err) {Utils.internalServerError(err, res, log);}
    }

    /**
     * Twitterに問い合わせる
     *
     * @param   accessToken     アクセストークン
     * @param   refreshToken    リフレッシュトークン
     */
    protected inquiry(accessToken : string, refreshToken : string) : Promise<void>
    {
        const log = slog.stepIn(Twitter.CLS_NAME_2, 'inquiry');
        return new Promise((resolve : () => void) =>
        {
            try
            {
                const provider = new twit(
                {
                    consumer_key:        Config.TWITTER_CONSUMER_KEY,
                    consumer_secret:     Config.TWITTER_CONSUMER_SECRET,
                    access_token:        accessToken,
                    access_token_secret: refreshToken
                });

                provider
                    .get('account/verify_credentials', {skip_status:true})
                    .then((result) =>
                    {
//                      console.log(JSON.stringify(result, null, 2));
                        const success = this.validateAccessToken(accessToken, result);

                        if (success)
                        {
                            const data = result.data;
                            this.id =   data.id_str;
                            this.name = data.name;
                        }

                        log.stepOut();
                        resolve();
                    })
                    .catch((err) =>
                    {
                        log.d(err);
                        log.stepOut();
                        resolve();
                    });
            }
            catch (err)
            {
                log.d(err);
                log.stepOut();
                resolve();
            }
        });
    }

    /**
     * @param   accessToken アクセストークン
     * @param   result      account/verify_credentialsのレスポンス
     */
    private validateAccessToken(_accessToken : string, result) : boolean
    {
        const log = slog.stepIn(Twitter.CLS_NAME_2, 'validateAccessToken');
        let success = false;

        if ('errors' in result.data === false)
        {
            const auths : string[] = result.resp.request.headers.Authorization.split(',');
            for (const auth of auths)
            {
                const pair = auth.split('=');
                if (pair[0] === 'OAuth oauth_consumer_key')
                {
                    const consumerKey = pair[1].replace(/"/g, '');
                    success = (consumerKey === Config.TWITTER_CONSUMER_KEY);

                    if (success === false) {
                        log.w(consumerKey);
                    }

                    break;
                }
            }
        }
        else
        {
//          log.w(JSON.stringify(result, null, 2));
            log.w(result.data.errors.message);
        }

        log.stepOut();
        return success;
    }
}
