/**
 * (C) 2016 printf.jp
 */
import Provider from './provider';
import Utils    from '../libs/utils';
import Config   from '../config';

import express =         require('express');
import passportTwitter = require('passport-twitter');
const co =               require('co');
const twit =             require('twit');
const slog =             require('../slog');

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
     * passportFacebook.Strategyに渡すコールバック
     *
     * @param   accessToken     アクセストークン
     * @param   refreshToken    リフレッシュトークン
     * @param   profile         プロフィール
     * @param   done
     */
    static verify(accessToken : string, refreshToken : string, profile : passportTwitter.Profile, done : Function) : void
    {
        super._verify(accessToken, refreshToken, profile, done);
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
        const self = this;

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
                    .then(function (result)
                    {
//                      console.log(JSON.stringify(result, null, 2));

                        if ('id_str' in result.data)
                        {
                            self.id = result.data.id_str;
                            log.d(`name:${result.data.name}`);
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
}
