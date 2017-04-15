/**
 * (C) 2016 printf.jp
 */
import Config   from '../config';
import Utils    from '../libs/utils';
import Provider from './provider';

import express =          require('express');
import passportFacebook = require('passport-facebook');
import slog =             require('../slog');
const fb =                require('fb');

/**
 * Facebook
 */
export default class Facebook extends Provider
{
    private static CLS_NAME_2 = 'Facebook';
    private static APP_ACCESS_TOKEN = null;

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
        super._verify('facebook', accessToken, refreshToken, done);
    }

    /**
     * Twitterからのコールバック用
     *
     * @param   req httpリクエスト
     * @param   res httpレスポンス
     */
    static async callback(req : express.Request, res : express.Response)
    {
        const log = slog.stepIn(Facebook.CLS_NAME_2, 'callback');
        try
        {
            const facebook = new Facebook();
            await facebook.signupOrLogin(req, res);
            log.stepOut();
        }
        catch (err) {Utils.internalServerError(err, res, log)};
    }

    /**
     * Facebookに問い合わせる
     *
     * @param   accessToken     アクセストークン
     * @param   refreshToken    リフレッシュトークン
     */
    protected inquiry(accessToken : string, refreshToken : string)
    {
        const log = slog.stepIn(Facebook.CLS_NAME_2, 'inquiry');
        const self = this;

        return new Promise(async (resolve : () => void, reject) =>
        {
            try
            {
                const success = await self.validateAccessToken(accessToken);

                if (success)
                    await self.me(accessToken);

                resolve();
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
     *
     * @return  boolean
     */
    private validateAccessToken(accessToken : string) : Promise<boolean>
    {
        const log = slog.stepIn(Facebook.CLS_NAME_2, 'validateAccessToken');
        return new Promise((resolve : BooleanResolve, reject) =>
        {
            fb.api('debug_token',
            {
                input_token: accessToken,
                access_token: Facebook.APP_ACCESS_TOKEN
            },
            (result) =>
            {
                let error = ('error' in result);

                if (error)
                    log.w(JSON.stringify(result, null, 2));

                log.stepOut();
                resolve(error === false);
            });
        });
    }

    /**
     * @param   accessToken     アクセストークン
     *
     * @return  なし
     */
    private me(accessToken : string)
    {
        const log = slog.stepIn(Facebook.CLS_NAME_2, 'me');
        return new Promise((resolve : () => void, reject) =>
        {
            fb.api('me',
            {
                fields:       ['id', 'name'],
                access_token: accessToken
            },
            (result) =>
            {
//              console.log(JSON.stringify(result, null, 2));
                if ('id' in result)
                {
                    this.id =   result.id;
                    this.name = result.name;
                }
                else
                {
                    log.d(JSON.stringify(result, null, 2));
                }

                log.stepOut();
                resolve();
            });
        });
    }

    /**
     * 初期化
     */
    static init() : void
    {
        fb.api('oauth/access_token',
        {
            client_id:     Config.FACEBOOK_APPID,
            client_secret: Config.FACEBOOK_APPSECRET,
            grant_type:    'client_credentials'
        },
        (result) =>
        {
            const log = slog.stepIn(Facebook.CLS_NAME_2, 'init');
            if ('error' in result)
            {
                log.e(JSON.stringify(result, null, 2));
                log.stepOut();

                console.log('Facebook init failed.');
                setTimeout(() => process.exit(), 3000);
            }
            else
            {
                Facebook.APP_ACCESS_TOKEN = result.access_token;
                log.stepOut();
            }
        });
    }
}