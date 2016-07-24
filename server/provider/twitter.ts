/**
 * (C) 2016 printf.jp
 */
import Provider from './provider';
import Utils    from '../libs/utils';
import Config   from '../config';

import express =         require('express');
import passportTwitter = require('passport-twitter');
import slog =            require('../slog');
const co =               require('co');
const twit =             require('twit');

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
    static verify(accessToken : string, refreshToken : string, profile : passportTwitter.Profile, done : Function) : void
    {
        super._verify('twitter', accessToken, refreshToken, done);
    }

    /**
     * Twitterからのコールバック用
     *
     * @param   req httpリクエスト
     * @param   res httpレスポンス
     */
    static callback(req : express.Request, res : express.Response) : void
    {
        const log = slog.stepIn(Twitter.CLS_NAME_2, 'callback');
        co(function* ()
        {
            const twitter = new Twitter();
            yield twitter.signupOrLogin(req, res);
            log.stepOut();
        })
        .catch ((err) => Utils.internalServerError(err, res, log));
    }

    /**
     * Twitterに問い合わせる
     *
     * @param   accessToken     アクセストークン
     * @param   refreshToken    リフレッシュトークン
     */
    protected inquiry(accessToken : string, refreshToken : string) : Promise<any>
    {
        const log = slog.stepIn(Twitter.CLS_NAME_2, 'inquiry');
        return new Promise((resolve, reject) =>
        {
            try
            {
                const provider = new twit(
                {
                    consumer_key:         Config.TWITTER_CONSUMER_KEY,
                    consumer_secret:      Config.TWITTER_CONSUMER_SECRET,
                    access_token:         accessToken,
                    access_token_secret : refreshToken
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
                    .catch(function (err)
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
    private validateAccessToken(accessToken : string, result) : boolean
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

                    if (success === false)
                        log.w(consumerKey);

                    break;
                }
            }
        }

        log.stepOut();
        return success;
    }
}
