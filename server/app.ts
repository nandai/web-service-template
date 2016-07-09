/**
 * (C) 2016 printf.jp
 */

/// <reference path='../typings/tsd.d.ts' />;

import Config             from './config';
import SeqModel           from './models/seq-model';
import AccountModel       from './models/account-model';
import SessionModel       from './models/session-model';
import LoginHistoryModel  from './models/login-history-model';
import DeleteAccountModel from './models/delete-account-model';
import TopController      from './controllers/top-controller';
import SignupController   from './controllers/signup-controller';
import ForgetController   from './controllers/forget-controller';
import ResetController    from './controllers/reset-controller';
import SettingsController from './controllers/settings-controller';
import SignupApi          from './api/signup-api';
import LoginApi           from './api/login-api';
import LogoutApi          from './api/logout-api';
import ResetApi           from './api/reset-api';
import SettingsApi        from './api/settings-api';
import Twitter            from './auth/twitter';
import Facebook           from './auth/facebook';
import Google             from './auth/google';
import Email              from './auth/email';
import Access             from './libs/access';
import Cookie             from './libs/cookie';

import express =          require('express');
import session =          require('express-session');
import cookieParser =     require('cookie-parser');
import bodyParser =       require('body-parser');
import passport =         require('passport');
import passportTwitter =  require('passport-twitter');
import passportFacebook = require('passport-facebook');
import passportGoogle =   require('passport-google-oauth');
import https =            require('https');
import fs =               require('fs');
import slog =             require('./slog');
const ect =               require('ect');

/**
 * イニシャライザ
 */
class Initializer
{
    app : express.Express;

    /**
     * @constructor
     */
    constructor(app : express.Express)
    {
        Config.            load();
        SeqModel.          load();
        AccountModel.      load();
        SessionModel.      load();
        LoginHistoryModel. load();
        DeleteAccountModel.load();

        this.app = app;
        this.app.use(express.static(Config.STATIC_DIR));    // 静的コンテンツの設定は最初に行う
        this.app.use(cookieParser());
        this.app.use(bodyParser.urlencoded({extended:true}));
        this.app.use(Access.jsonBodyParser);
        this.app.use(Access.logger);
    }

    /**
     * twitterを初期化する
     */
    twitter() : void
    {
        const options : passportTwitter.IStrategyOption =
        {
            consumerKey:    Config.TWITTER_CONSUMER_KEY,
            consumerSecret: Config.TWITTER_CONSUMER_SECRET,
            callbackURL:    Config.TWITTER_CALLBACK
        };

        passport.use(new passportTwitter.Strategy(options, Twitter.verify));
    }

    /**
     * facebookを初期化する
     */
    facebook() : void
    {
        const options : passportFacebook.IStrategyOption =
        {
            clientID:     Config.FACEBOOK_APPID,
            clientSecret: Config.FACEBOOK_APPSECRET,
            callbackURL:  Config.FACEBOOK_CALLBACK
        };

        passport.use(new passportFacebook.Strategy(options, Facebook.verify));
    }

    /**
     * googleを初期化する
     */
    google() : void
    {
        const options : passportGoogle.IOAuth2StrategyOption =
        {
            clientID:     Config.GOOGLE_CLIENT_ID,
            clientSecret: Config.GOOGLE_CLIENT_SECRET,
            callbackURL:  Config.GOOGLE_CALLBACK
        };

        passport.use(new passportGoogle.OAuth2Strategy(options, Google.verify));
    }

    /**
     * rendererを初期化する
     */
    renderer() : void
    {
        const ectRenderer = ect(
        {
            watch: true,
//          root: Config.VIEWS_DIR,
            ext : '.ect'
        });

        this.app.engine('ect', ectRenderer.render);
        this.app.set('view engine', 'ect');
        this.app.set('views', Config.VIEWS_DIR);
    }

    /**
     * sessionを初期化する
     */
    session() : void
    {
        const options : session.SessionOptions =
        {
            secret: Config.SESSION_SECRET,
            resave: false,
            saveUninitialized: false
        };

        this.app.use(session(options));
    }

    /**
     * passportを初期化する
     */
    passport() : void
    {
        this.app.use(passport.initialize());
    }

    /**
     * routeを初期化する
     */
    route() : void
    {
        this.app.get( '/',       TopController.   index);
        this.app.get( '/signup', SignupController.index);
        this.app.get( '/forget', ForgetController.index);
        this.app.get( '/reset',  ResetController. index);
        this.app.get( '/settings/account/email/change', SettingsController.changeEmail);

        this.app.post('/api/signup/twitter',       SignupApi.twitter);
        this.app.post('/api/signup/facebook',      SignupApi.facebook);
        this.app.post('/api/signup/google',        SignupApi.google);
        this.app.post('/api/signup/email',         SignupApi.email);
        this.app.post('/api/signup/email/confirm', SignupApi.confirmEmail);
        this.app.post('/api/login/twitter',        LoginApi. twitter);
        this.app.post('/api/login/facebook',       LoginApi. facebook);
        this.app.post('/api/login/google',         LoginApi. google);
        this.app.post('/api/login/email',          LoginApi. email);
        this.app.post('/api/reset',                ResetApi. index);
        this.app.put( '/api/reset/change',         ResetApi. change);
        this.app.put( '/api/settings/account/email/change', SettingsApi.changeEmail);

        this.app.get( '/auth/twitter',           passport.authenticate('twitter'));
        this.app.get( '/auth/twitter/callback',  Twitter.customCallback, Twitter.callback);
        this.app.get( '/auth/facebook',          passport.authenticate('facebook'));
        this.app.get( '/auth/facebook/callback', Facebook.customCallback, Facebook.callback);
        this.app.get( '/auth/google',            passport.authenticate('google', {scope:['https://www.googleapis.com/auth/plus.login']}));
        this.app.get( '/auth/google/callback',   Google.customCallback, Google.callback);

        this.app.use(Access.auth);

        this.app.get(   '/settings',               SettingsController.index);
        this.app.get(   '/settings/account/email', SettingsController.email);

        this.app.get(   '/api/settings/account',               SettingsApi.account);
        this.app.put(   '/api/settings/account/email',         SettingsApi.email);
        this.app.post(  '/api/settings/account/link/twitter',  SettingsApi.linkTwitter);
        this.app.post(  '/api/settings/account/link/facebook', SettingsApi.linkFacebook);
        this.app.post(  '/api/settings/account/link/google',   SettingsApi.linkGoogle);
        this.app.delete('/api/settings/account/leave',         SettingsApi.leave);
        this.app.post(  '/api/logout',                         LogoutApi.  index);

        this.app.use(Access.notFound);
    }
}

/**
 * main
 */
function main() : void
{
    slog.setConfig( 'ws://localhost:8080', 'webServiceTemplate.log', 'ALL', 'slog', 'gols');
//  slog.setConfig('wss://localhost:8443', 'webServiceTemplate.log', 'ALL', 'slog', 'gols');

    const log = slog.stepIn('app.ts', 'main');
    const app = express();
    const init = new Initializer(app);

    init.twitter();
    init.facebook();
    init.google();
    init.renderer();
    init.session();
    init.passport();
    init.route();

    listen(app);
    log.stepOut();
}

/**
 * listen
 */
function listen(app : express.Express) : void
{
    const log = slog.stepIn('app.ts', 'listen');
    let server = null;

    if (Config.hasSSL())
    {
        const options : https.ServerOptions =
        {
            key:  null,
            cert: null,
            ca:   null,
            passphrase: Config.SSL_PASSPHRASE,
            requestCert: true,
            rejectUnauthorized: false
        };

        try
        {
            options.key =  fs.readFileSync(Config.SSL_KEY);
            options.cert = fs.readFileSync(Config.SSL_CERT);
            options.ca =   fs.readFileSync(Config.SSL_CA);
        }
        catch (err)
        {
            const message = `${err.path}を開けませんでした。`;
            log.w(message);
            console.error(message);
        }

        try
        {
            server = https.createServer(options, app).listen(Config.APP_PORT);
        }
        catch (err)
        {
            log.w(err.stack);
            console.error(err.stack);
        }
    }
    else
    {
        server = app.listen(Config.APP_PORT);
    }

    log.stepOut();

    if (server === null)
        setTimeout(() => process.exit(), 3000);
}

main();
