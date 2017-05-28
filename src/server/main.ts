/**
 * (C) 2016-2017 printf.jp
 */
import LoginApi                      from './api/login-api';
import LogoutApi                     from './api/logout-api';
import ResetApi                      from './api/reset-api';
import SettingsApi                   from './api/settings-api';
import SignupApi                     from './api/signup-api';
import UserApi                       from './api/user-api';
import ForgetApp                     from './app/forget-app';
import JoinApp                       from './app/join-app';
import LoginApp                      from './app/login-app';
import ResetApp                      from './app/reset-app';
import SettingsAccountApp            from './app/settings-account-app';
import SettingsAccountEmailApp       from './app/settings-account-email-app';
import SettingsAccountEmailChangeApp from './app/settings-account-email-change-app';
import SettingsAccountPasswordApp    from './app/settings-account-password-app';
import SettingsApp                   from './app/settings-app';
import SettingsInviteApp             from './app/settings-invite-app';
import SignupApp                     from './app/signup-app';
import UserApp                       from './app/user-app';
import UsersApp                      from './app/users-app';
import Config                        from './config';
import Access                        from './libs/access';
import Authy                         from './libs/authy';
import {expressExtension}            from './libs/express-extension';
import R                             from './libs/r';
import Utils                         from './libs/utils';
import AccountModel                  from './models/account-model';
import DeleteAccountModel            from './models/delete-account-model';
import LoginHistoryModel             from './models/login-history-model';
import SeqModel                      from './models/seq-model';
import SessionModel, {Session}       from './models/session-model';
import Email                         from './provider/email';
import Facebook                      from './provider/facebook';
import Github                        from './provider/github';
import Google                        from './provider/google';
import Twitter                       from './provider/twitter';

import bodyParser =       require('body-parser');
import cookieParser =     require('cookie-parser');
import express =          require('express');
import session =          require('express-session');
import fs =               require('fs');
import helmet =           require('helmet');
import https =            require('https');
import passport =         require('passport');
import passportFacebook = require('passport-facebook');
import passportGithub =   require('passport-github');
import passportGoogle =   require('passport-google-oauth');
import passportTwitter =  require('passport-twitter');
import slog =             require('./slog');

/**
 * イニシャライザ
 */
class Initializer
{
    private app : express.Express;

    /**
     * @constructor
     */
    constructor(app : express.Express)
    {
        fs.mkdir(Config.ROOT_DIR + '/storage', '0755', () => {});

        Config.            load();
        SeqModel.          load();
        AccountModel.      load();
        SessionModel.      load();
        LoginHistoryModel. load();
        DeleteAccountModel.load();
        R.                 load();

        Authy.init();

        this.app = app;
        this.app.use(helmet.hidePoweredBy());
        this.app.use(helmet.noSniff());
        this.app.use(express.static(Config.STATIC_DIR));    // 静的コンテンツの設定は最初に行う
        this.app.use(expressExtension);
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
        if (Config.TWITTER_CONSUMER_KEY    !== ''
        &&  Config.TWITTER_CONSUMER_SECRET !== '')
        {
            const options : passportTwitter.IStrategyOption =
            {
                consumerKey:    Config.TWITTER_CONSUMER_KEY,
                consumerSecret: Config.TWITTER_CONSUMER_SECRET,
                callbackURL:    Config.TWITTER_CALLBACK
            };

            passport.use(new passportTwitter.Strategy(options, Twitter.verify));
        }
        else
        {
            console.warn('Twitter認証は未設定です。');
        }
    }

    /**
     * facebookを初期化する
     */
    facebook() : void
    {
        if (Config.FACEBOOK_APPID     !== ''
        &&  Config.FACEBOOK_APPSECRET !== '')
        {
            const options : passportFacebook.IStrategyOption =
            {
                clientID:     Config.FACEBOOK_APPID,
                clientSecret: Config.FACEBOOK_APPSECRET,
                callbackURL:  Config.FACEBOOK_CALLBACK
            };

            passport.use(new passportFacebook.Strategy(options, Facebook.verify));
            Facebook.init();
        }
        else
        {
            console.warn('Facebook認証は未設定です。');
        }
    }

    /**
     * googleを初期化する
     */
    google() : void
    {
        if (Config.GOOGLE_CLIENT_ID     !== ''
        &&  Config.GOOGLE_CLIENT_SECRET !== '')
        {
            const options : passportGoogle.IOAuth2StrategyOption =
            {
                clientID:     Config.GOOGLE_CLIENT_ID,
                clientSecret: Config.GOOGLE_CLIENT_SECRET,
                callbackURL:  Config.GOOGLE_CALLBACK
            };

            passport.use(new passportGoogle.OAuth2Strategy(options, Google.verify));
        }
        else
        {
            console.warn('Google認証は未設定です。');
        }
    }

    /**
     * githubを初期化する
     */
    github() : void
    {
        if (Config.GOOGLE_CLIENT_ID     !== ''
        &&  Config.GOOGLE_CLIENT_SECRET !== '')
        {
            const options : passportGithub.StrategyOption =
            {
                clientID:     Config.GITHUB_CLIENT_ID,
                clientSecret: Config.GITHUB_CLIENT_SECRET,
                callbackURL:  Config.GITHUB_CALLBACK
            };

            passport.use(new passportGithub.Strategy(options, Github.verify));
        }
        else
        {
            console.warn('Github認証は未設定です。');
        }
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
        this.app.use(Access.session);
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
        const signupCommand = command('signup');
        const loginCommand =  command('login');
        const linkCommand =   command('link');

        const authTwitter =  passport.authenticate('twitter');
        const authFacebook = passport.authenticate('facebook');
        const authGoogle =   passport.authenticate('google', {scope:['https://www.googleapis.com/auth/plus.login']});
        const authGithub =   passport.authenticate('github');

        const provider = ':provider(twitter|facebook|google)';

        this.app.get('/',       LoginApp .index);
        this.app.get('/about',  LoginApp .about);
        this.app.get('/signup', SignupApp.index);
        this.app.get('/join',   JoinApp  .index);
        this.app.get('/forget', ForgetApp.index);
        this.app.get('/reset',  ResetApp .index);

        if (Config.hasTwitter())
        {
            this.app.get('/signup/twitter',                              signupCommand, authTwitter);
            this.app.get('/login/twitter',                               loginCommand,  authTwitter);
            this.app.get('/settings/account/link/twitter',  Access.auth, linkCommand,   authTwitter);
        }

        if (Config.hasFacebook())
        {
            this.app.get('/signup/facebook',                             signupCommand, authFacebook);
            this.app.get('/login/facebook',                              loginCommand,  authFacebook);
            this.app.get('/settings/account/link/facebook', Access.auth, linkCommand,   authFacebook);
        }

        if (Config.hasGoogle())
        {
            this.app.get('/signup/google',                             signupCommand, authGoogle);
            this.app.get('/login/google',                              loginCommand,  authGoogle);
            this.app.get('/settings/account/link/google', Access.auth, linkCommand,   authGoogle);
        }

        if (Config.hasGithub())
        {
            this.app.get('/signup/github',                             signupCommand, authGithub);
            this.app.get('/login/github',                              loginCommand,  authGithub);
            this.app.get('/settings/account/link/github', Access.auth, linkCommand,   authGithub);
        }

        this.app.get('/settings',                       Access.auth, SettingsApp                  .index);
        this.app.get('/settings/account',               Access.auth, SettingsAccountApp           .index);
        this.app.get('/settings/account/email',         Access.auth, SettingsAccountEmailApp      .index);
        this.app.get('/settings/account/email/change',               SettingsAccountEmailChangeApp.index);
        this.app.get('/settings/account/password',      Access.auth, SettingsAccountPasswordApp   .index);
        this.app.get('/settings/invite',                Access.auth, SettingsInviteApp            .index);

        this.app.get('/users/:id(\\d+)', UserApp .index);
        this.app.get('/users',           UsersApp.index);

        // APIs
        this.app.post(  `/api/signup/${provider}`,   SignupApi.onSignupProvider);
        this.app.post(  '/api/signup/email',         SignupApi.onSignupEmail);
        this.app.post(  '/api/signup/email/confirm', SignupApi.onConfirmSignupEmail);
        this.app.post(  '/api/join',                 SignupApi.onJoin);
        this.app.post(  `/api/login/${provider}`,    LoginApi .onLoginProvider);
        this.app.post(  '/api/login/email',          LoginApi .onLoginEmail);
        this.app.post(  '/api/login/sms',            LoginApi .onLoginSms);
        this.app.get(   '/api/login/authy/onetouch', LoginApi .onLoginAuthyOneTouch);
        this.app.post(  '/api/reset',                ResetApi .onRequestResetPassword);
        this.app.put(   '/api/reset/change',         ResetApi .onResetPassword);
        this.app.get(   '/api/user',                 UserApi  .onGetUser);
        this.app.get(   '/api/users',                UserApi  .onGetUserList);

        this.app.get(   '/api/settings/account',              Access.auth, SettingsApi.onGetAccount);
        this.app.put(   '/api/settings/account',              Access.auth, SettingsApi.onSetAccount);
        this.app.delete('/api/settings/account',              Access.auth, SettingsApi.onDeleteAccount);
        this.app.put(   `/api/settings/account/unlink`,       Access.auth, SettingsApi.onUnlinkProvider);
        this.app.put(   '/api/settings/account/email',        Access.auth, SettingsApi.onRequestChangeEmail);
        this.app.put(   '/api/settings/account/email/change',              SettingsApi.onChangeEmail);
        this.app.put(   '/api/settings/account/password',     Access.auth, SettingsApi.onChangePassword);
        this.app.post(  '/api/settings/invite',               Access.auth, SettingsApi.onInvite);
        this.app.post(  '/api/logout',                        Access.auth, LogoutApi  .onLogout);

        this.app.get('/auth/twitter/callback',  Twitter. customCallback, Twitter .callback);
        this.app.get('/auth/facebook/callback', Facebook.customCallback, Facebook.callback);
        this.app.get('/auth/google/callback',   Google.  customCallback, Google  .callback);
        this.app.get('/auth/github/callback',   Github.  customCallback, Github  .callback);

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
    init.github();
    init.session();
    init.passport();
    init.route();

    listen(app);
    console.log('ready.');
    log.stepOut();
}

/**
 * コマンド設定
 *
 * @param   command コマンド
 */
function command(command : string) : express.Handler
{
    const handler = async (req : express.Request, res : express.Response, next : express.NextFunction) =>
    {
        const log = slog.stepIn('app.ts', 'command');
        log.d(command);

        try
        {
            const session : Session = req.ext.session;
            session.command_id = command;
            await SessionModel.update(session);

            log.stepOut();
            next();
        }
        catch (err) {Utils.internalServerError(err, res, log);}
    };
    return handler;
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

    console.log('URL ........ ' + Utils.generateUrl(''));
    log.stepOut();

    if (server === null) {
        setTimeout(() => process.exit(), 3000);
    }
}

main();
