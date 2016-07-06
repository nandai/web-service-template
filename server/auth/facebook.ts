/**
 * (C) 2016 printf.jp
 */
import Provider from './provider';
import Utils    from '../libs/utils';

import express =          require('express');
import passportFacebook = require('passport-facebook');
const co =                require('co');
const fb =                require('fb');
const slog =              require('../slog');

/**
 * Facebook
 */
export default class Facebook extends Provider
{
    private static CLS_NAME_2 = 'Facebook';

    /**
     * カスタムコールバック
     */
    static customCallback(req : express.Request, res : express.Response, next : express.NextFunction)
    {
        super._customCallback('facebook', req, res, next);
    }

    /**
     * passportFacebook.Strategyに渡すコールバック
     *
     * @param   accessToken     アクセストークン
     * @param   refreshToken    リフレッシュトークン
     * @param   profile         プロフィール
     * @param   done
     */
    static verify(accessToken : string, refreshToken : string, profile : passportFacebook.Profile, done : Function) : void
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
        const log = slog.stepIn(Facebook.CLS_NAME_2, 'callback');
        co(function* ()
        {
            const facebook = new Facebook();
            yield facebook.signupOrLogin(req, res);
            log.stepOut();
        })
        .catch ((err) => Utils.internalServerError(err, res, log));
    }

    /**
     * Facebookに問い合わせる
     *
     * @param   accessToken     アクセストークン
     * @param   refreshToken    リフレッシュトークン
     */
    protected inquiry(accessToken : string, refreshToken : string) : Promise<any>
    {
        const log = slog.stepIn(Facebook.CLS_NAME_2, 'inquiry');
        const self = this;

        return new Promise((resolve, reject) =>
        {
            try
            {
                fb.api('me',
                {
                    fields:       ['id', 'name'],
                    access_token: accessToken
                },
                function (result)
                {
//                  console.log(JSON.stringify(result, null, 2));

                    if ('id' in result)
                    {
                        self.id = result.id;
                        log.d(`name:${result.name}`);
                    }
                    else
                    {
                        log.d(JSON.stringify(result, null, 2));
                    }

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
