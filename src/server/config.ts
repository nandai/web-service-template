/**
 * (C) 2016 printf.jp
 */
import Utils from './libs/utils';

import fs =   require('fs');
import path = require('path');

const rootDir = __dirname + '/../..';

process.env.NODE_ENV = process.env.NODE_ENV || 'development';
console.log('NODE_ENV ... ' + process.env.NODE_ENV);

/**
 * コンフィグ
 */
export default class Config
{
    private static path = `${rootDir}/config/${process.env.NODE_ENV}/appconfig.json`;

    static ROOT_DIR =   rootDir;
    static STATIC_DIR = rootDir + '/www/static';

    static APP_PORT = 0;
    static APP_URL = '';
    static SSL_KEY = '';
    static SSL_CERT = '';
    static SSL_CA = '';
    static SSL_PASSPHRASE = '';
    static SESSION_SECRET = '';
    static PASSWORD_SALT = '';
    static CRYPTO_KEY = '';
    static CRYPTO_IV = '';

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

    static GITHUB_CLIENT_ID = '';
    static GITHUB_CLIENT_SECRET = '';
    static GITHUB_CALLBACK = '';

    static TWILIO_ACCOUNT_SID = '';
    static TWILIO_AUTH_TOKEN = '';
    static TWILIO_FROM_PHONE_NO = '';
    static AUTHY_API_KEY = '';

    static DB_HOST = '';
    static DB_USER = '';
    static DB_PASSWORD = '';
    static DB_NAME = '';

    static MONGO_URL = '';

    static SELECT_DB = '';

    static REDIS_URL = '';

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

        Config.APP_PORT =                Config.get(appData, 'app-port', 'number');
        Config.APP_URL =                 Config.get(appData, 'app-url');
        Config.SSL_KEY =                 Config.get(appData, 'ssl-key');
        Config.SSL_CERT =                Config.get(appData, 'ssl-cert');
        Config.SSL_CA =                  Config.get(appData, 'ssl-ca');
        Config.SSL_PASSPHRASE =          Config.get(appData, 'ssl-passphrase');
        Config.SESSION_SECRET =          Config.get(appData, 'session-secret');
        Config.PASSWORD_SALT =           Config.get(appData, 'password-salt');
        Config.CRYPTO_KEY =              Config.get(appData, 'crypto-key');
        Config.CRYPTO_IV =               Config.get(appData, 'crypto-iv');
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
        Config.GITHUB_CLIENT_ID =        Config.get(appData, 'github-client-id');
        Config.GITHUB_CLIENT_SECRET =    Config.get(appData, 'github-client-secret');
        Config.TWILIO_ACCOUNT_SID =      Config.get(appData, 'twilio-account-sid');
        Config.TWILIO_AUTH_TOKEN =       Config.get(appData, 'twilio-auth-token');
        Config.TWILIO_FROM_PHONE_NO =    Config.get(appData, 'twilio-from-phone-no');
        Config.AUTHY_API_KEY =           Config.get(appData, 'authy-api-key');
        Config.DB_HOST =                 Config.get(appData, 'db-host');
        Config.DB_USER =                 Config.get(appData, 'db-user');
        Config.DB_PASSWORD =             Config.get(appData, 'db-password');
        Config.DB_NAME =                 Config.get(appData, 'db-name');
        Config.MONGO_URL =               Config.get(appData, 'mongo-url');
        Config.SELECT_DB =               Config.get(appData, 'select-db');
        Config.REDIS_URL =               Config.get(appData, 'redis-url');

        Config.TWITTER_CALLBACK =  Utils.generateUrl('auth/twitter/callback');
        Config.FACEBOOK_CALLBACK = Utils.generateUrl('auth/facebook/callback');
        Config.GOOGLE_CALLBACK =   Utils.generateUrl('auth/google/callback');
        Config.GITHUB_CALLBACK =   Utils.generateUrl('auth/github/callback');

        if (Config.hasMySQL() === false && Config.hasMongoDB() === false)
        {
            console.log(`データベースの設定がありません。`);
            process.exit();
        }

        Config.SELECT_DB = Config.SELECT_DB.toLowerCase();
        if (Config.SELECT_DB !== 'mysql' && Config.SELECT_DB !== 'mongodb')
        {
            console.log('使用するデータベースの指定が正しくありません。');
            process.exit();
        }
    }

    /**
     * データを取得する
     */
    private static get(data, key : string, type : string = 'string') : any
    {
        const result = data[key];
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

    /**
     * Twitterの設定があるかどうか調べる
     */
    static hasTwitter() : boolean
    {
        if (Config.TWITTER_CONSUMER_KEY    !== ''
        &&  Config.TWITTER_CONSUMER_SECRET !== '')
        {
            return true;
        }
        return false;
    }

    /**
     * Facebookの設定があるかどうか調べる
     */
    static hasFacebook() : boolean
    {
        if (Config.FACEBOOK_APPID     !== ''
        &&  Config.FACEBOOK_APPSECRET !== '')
        {
            return true;
        }
        return false;
    }

    /**
     * Googleの設定があるかどうか調べる
     */
    static hasGoogle() : boolean
    {
        if (Config.GOOGLE_CLIENT_ID     !== ''
        &&  Config.GOOGLE_CLIENT_SECRET !== '')
        {
            return true;
        }
        return false;
    }

    /**
     * Githubの設定があるかどうか調べる
     */
    static hasGithub() : boolean
    {
        if (Config.GITHUB_CLIENT_ID     !== ''
        &&  Config.GITHUB_CLIENT_SECRET !== '')
        {
            return true;
        }
        return false;
    }

    /**
     * Twilioの設定があるかどうか調べる
     */
    static hasTwilio() : boolean
    {
        if (Config.TWILIO_ACCOUNT_SID   !== ''
        &&  Config.TWILIO_AUTH_TOKEN    !== ''
        &&  Config.TWILIO_FROM_PHONE_NO !== '')
        {
            return true;
        }
        return false;
    }

    /**
     * Authyの設定があるかどうか調べる
     */
    static hasAuthy() : boolean
    {
        if (Config.AUTHY_API_KEY !== '')
        {
            return true;
        }
        return false;
    }

    /**
     * MySQLの設定があるかどうか調べる
     */
    static hasMySQL() : boolean
    {
        if (Config.DB_HOST     !== ''
        &&  Config.DB_USER     !== ''
        &&  Config.DB_PASSWORD !== ''
        &&  Config.DB_NAME     !== '')
        {
            return true;
        }
        return false;
    }

    /**
     * MongoDBの設定があるかどうか調べる
     */
    static hasMongoDB() : boolean
    {
        if (Config.MONGO_URL !== '')
        {
            return true;
        }
        return false;
    }
}
