/**
 * (C) 2016 printf.jp
 */
import Provider from './provider';
import Utils    from '../libs/utils';
import Config   from '../config';

import express =        require('express');
import passportGoogle = require('passport-google-oauth');
import slog =           require('../slog');
const co =              require('co');
const google =          require('googleapis');

const plus = google.plus('v1');
const oauth2Client = new google.auth.OAuth2(Config.GOOGLE_CLIENT_ID, Config.GOOGLE_CLIENT_SECRET, Config.GOOGLE_CALLBACK);

/**
 * Google
 */
export default class Google extends Provider
{
    private static CLS_NAME_2 = 'Google';

    /**
     * カスタムコールバック
     */
    static customCallback(req : express.Request, res : express.Response, next : express.NextFunction)
    {
        super._customCallback('google', req, res, next);
    }

    /**
     * passportGoogle.Strategyに渡すコールバック
     *
     * @param   accessToken     アクセストークン
     * @param   refreshToken    リフレッシュトークン
     * @param   profile         プロフィール
     * @param   done
     */
    static verify(accessToken : string, refreshToken : string, profile : passportGoogle.Profile, done : Function) : void
    {
        super._verify('google', accessToken, refreshToken, done);
    }

    /**
     * Twitterからのコールバック用
     *
     * @param   req httpリクエスト
     * @param   res httpレスポンス
     */
    static callback(req : express.Request, res : express.Response) : void
    {
        const log = slog.stepIn(Google.CLS_NAME_2, 'callback');
        co(function* ()
        {
            const google = new Google();
            yield google.signupOrLogin(req, res);
            log.stepOut();
        })
        .catch ((err) => Utils.internalServerError(err, res, log));
    }

    /**
     * Googleに問い合わせる
     *
     * @param   accessToken     アクセストークン
     * @param   refreshToken    リフレッシュトークン
     */
    protected inquiry(accessToken : string, refreshToken : string) : Promise<any>
    {
        const log = slog.stepIn(Google.CLS_NAME_2, 'inquiry');
        const self = this;

        return new Promise((resolve, reject) =>
        {
            try
            {
                oauth2Client.setCredentials(
                {
                    access_token:  accessToken,
                    refresh_token: refreshToken
                });

                plus.people.get({userId:'me', auth:oauth2Client}, function(err, profile)
                {
//                  console.log(err);
//                  console.log(JSON.stringify(profile, null, 2));

                    if (profile)
                    {
                        self.id =   profile.id;
                        self.name = profile.displayName;
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
