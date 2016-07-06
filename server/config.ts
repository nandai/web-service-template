/**
 * (C) 2016 printf.jp
 */
import Utils from './libs/utils';

import fs =   require('fs');
import path = require('path');

/**
 * コンフィグ
 */
export default class Config
{
    private static path = __dirname + '/../appconfig.json';

    static STATIC_DIR = __dirname + '/../www/static';
    static VIEWS_DIR =  __dirname + '/../www/views';
    static APP_HOST = '';
    static APP_PORT = 0;
    static SESSION_SECRET = 'web service template';
    static PASSWORD_SALT = '';

    static SMTP_HOST = '';
    static SMTP_PORT = 0;
    static SMTP_USER = '';
    static SMTP_PASSWORD = '';
    static SMTP_FROM = '';

    static TWITTER_CONSUMER_KEY = '';
    static TWITTER_CONSUMER_SECRET = '';
    static TWITTER_CALLBACK = '';

    static FACEBOOK_APPID = '';
    static FACEBOOK_APPSECRET = '';
    static FACEBOOK_CALLBACK = '';

    static GOOGLE_CLIENT_ID = '';
    static GOOGLE_CLIENT_SECRET = '';
    static GOOGLE_CALLBACK = '';

    /**
     * コンフィグをJSONファイルからロードする
     */
    static load() : void
    {
        const absPath = path.resolve(Config.path);
        let text;
        let data;

        try
        {
            fs.statSync(absPath);
            text = fs.readFileSync(absPath, 'utf8');
        }
        catch (err)
        {
            console.log(`${absPath}が見つかりませんでした。`);
            process.exit();
        }

        try
        {
            data = JSON.parse(text);
        }
        catch (err)
        {
            console.log(`${absPath}がJSONではありません。`);
            process.exit();
        }

        let success = false;
        const appData = Config.get(data, 'app');

        Config.APP_HOST =                Config.get(appData, 'app-host');
        Config.APP_PORT =                Config.get(appData, 'app-port');
        Config.PASSWORD_SALT =           Config.get(appData, 'password-salt');
        Config.SMTP_HOST =               Config.get(appData, 'smtp-host');
        Config.SMTP_PORT =               Config.get(appData, 'smtp-port');
        Config.SMTP_USER =               Config.get(appData, 'smtp-user');
        Config.SMTP_PASSWORD =           Config.get(appData, 'smtp-password');
        Config.SMTP_FROM =               Config.get(appData, 'smtp-from');
        Config.TWITTER_CONSUMER_KEY =    Config.get(appData, 'twitter-consumer-key');
        Config.TWITTER_CONSUMER_SECRET = Config.get(appData, 'twitter-consumer-secret');
        Config.FACEBOOK_APPID =          Config.get(appData, 'facebook-app-id');
        Config.FACEBOOK_APPSECRET =      Config.get(appData, 'facebook-app-secret');
        Config.GOOGLE_CLIENT_ID =        Config.get(appData, 'google-client-id');
        Config.GOOGLE_CLIENT_SECRET =    Config.get(appData, 'google-client-secret');

        Config.TWITTER_CALLBACK =  Utils.generateUrl('auth/twitter/callback');
        Config.FACEBOOK_CALLBACK = Utils.generateUrl('auth/facebook/callback');
        Config.GOOGLE_CALLBACK =   Utils.generateUrl('auth/google/callback');
    }

    /**
     * データを取得する
     */
    private static get(data, key : string) : any
    {
        const result = data[key];
        if (result === undefined)
        {
            console.log(`${key}がありません。`);
            process.exit();
        }
        return result;
    }
}
