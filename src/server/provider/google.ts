/**
 * (C) 2016 printf.jp
 */
import {slog}   from 'libs/slog';
import Config   from 'server/config';
import Utils    from 'server/libs/utils';
import Provider from './provider';

import * as express        from 'express';
import {google}            from 'googleapis';
import * as passportGoogle from 'passport-google-oauth';

const plus = google.plus('v1');

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
    static verify(accessToken : string, refreshToken : string, _profile : passportGoogle.Profile, done) : void
    {
        super._verify('google', accessToken, refreshToken, done);
    }

    /**
     * Twitterからのコールバック用
     *
     * @param   req httpリクエスト
     * @param   res httpレスポンス
     */
    static async callback(req : express.Request, res : express.Response)
    {
        const log = slog.stepIn(Google.CLS_NAME_2, 'callback');
        try
        {
            const _google = new Google();
            await _google.signupOrLogin(req, res);
            log.stepOut();
        }
        catch (err) {Utils.internalServerError(err, res, log);}
    }

    /**
     * Googleに問い合わせる
     *
     * @param   accessToken     アクセストークン
     * @param   refreshToken    リフレッシュトークン
     */
    protected inquiry(accessToken : string, refreshToken : string)
    {
        const log = slog.stepIn(Google.CLS_NAME_2, 'inquiry');
        const self = this;

        return new Promise((resolve : () => void) =>
        {
            try
            {
                const oauth2Client = new google.auth.OAuth2(Config.GOOGLE_CLIENT_ID, Config.GOOGLE_CLIENT_SECRET, Config.GOOGLE_CALLBACK);
                oauth2Client.setCredentials(
                {
                    access_token:  accessToken,
                    refresh_token: refreshToken
                });

                plus.people.get({userId:'me', auth:oauth2Client}, (_err, profile) =>
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
