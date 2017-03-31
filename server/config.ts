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
    static APP_HOST = '';
    static APP_PORT = 0;
    static SSL_KEY = '';
    static SSL_CERT = '';
    static SSL_CA = '';
    static SSL_PASSPHRASE = '';
    static SESSION_SECRET = '';
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

    static TWILIO_ACCOUNT_SID = '';
    static TWILIO_AUTH_TOKEN = '';
    static TWILIO_FROM_PHONE_NO = '';

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

        const appData = Config.get(data, 'app', 'object');

        Config.APP_HOST =                Config.get(appData, 'app-host');
        Config.APP_PORT =                Config.get(appData, 'app-port', 'number');
        Config.SSL_KEY =                 Config.get(appData, 'ssl-key');
        Config.SSL_CERT =                Config.get(appData, 'ssl-cert');
        Config.SSL_CA =                  Config.get(appData, 'ssl-ca');
        Config.SSL_PASSPHRASE =          Config.get(appData, 'ssl-passphrase');
        Config.SESSION_SECRET =          Config.get(appData, 'session-secret');
        Config.PASSWORD_SALT =           Config.get(appData, 'password-salt');
        Config.SMTP_HOST =               Config.get(appData, 'smtp-host');
        Config.SMTP_PORT =               Config.get(appData, 'smtp-port', 'number');
        Config.SMTP_USER =               Config.get(appData, 'smtp-user');
        Config.SMTP_PASSWORD =           Config.get(appData, 'smtp-password');
        Config.SMTP_FROM =               Config.get(appData, 'smtp-from');
        Config.TWITTER_CONSUMER_KEY =    Config.get(appData, 'twitter-consumer-key');
        Config.TWITTER_CONSUMER_SECRET = Config.get(appData, 'twitter-consumer-secret');
        Config.FACEBOOK_APPID =          Config.get(appData, 'facebook-app-id');
        Config.FACEBOOK_APPSECRET =      Config.get(appData, 'facebook-app-secret');
        Config.GOOGLE_CLIENT_ID =        Config.get(appData, 'google-client-id');
        Config.GOOGLE_CLIENT_SECRET =    Config.get(appData, 'google-client-secret');
        Config.TWILIO_ACCOUNT_SID =      Config.get(appData, 'twilio-account-sid');
        Config.TWILIO_AUTH_TOKEN =       Config.get(appData, 'twilio-auth-token');
        Config.TWILIO_FROM_PHONE_NO =    Config.get(appData, 'twilio-from-phone-no');

        Config.TWITTER_CALLBACK =  Utils.generateUrl('auth/twitter/callback');
        Config.FACEBOOK_CALLBACK = Utils.generateUrl('auth/facebook/callback');
        Config.GOOGLE_CALLBACK =   Utils.generateUrl('auth/google/callback');
    }

    /**
     * データを取得する
     */
    private static get(data, key : string, type : string = 'string') : any
    {
        let result = data[key];
        if (result === undefined)
        {
            console.log(`${key}がありません。`);
            process.exit();
        }

        if (typeof result !== type)
        {
            console.log(`${key}の型が正しくありません。`);
            process.exit();
        }
        return result;
    }

    /**
     * SSLの設定があるかどうか調べる
     */
    static hasSSL() : boolean
    {
        if (Config.SSL_KEY  !== ''
        &&  Config.SSL_CERT !== ''
        &&  Config.SSL_CA   !== '')
        {
            return true;
        }
        return false;
    }
}
