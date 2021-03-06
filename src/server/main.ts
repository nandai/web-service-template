/**
 * (C) 2016-2017 printf.jp
 */
import {slog}                        from 'libs/slog';
import SessionAgent                  from './agents/session-agent';
import LoginApi                      from './api/login-api';
import LogoutApi                     from './api/logout-api';
import ResetApi                      from './api/reset-api';
import SettingsApi                   from './api/settings-api';
import SignupApi                     from './api/signup-api';
import UserApi                       from './api/user-api';
import AboutApp                      from './app/about-app';
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
import {loadCss}                     from './app/view';
import Config                        from './config';
import MongoDB                       from './database/mongodb';
import MySQL                         from './database/mysql';
import Access                        from './libs/access';
import Authy                         from './libs/authy';
import {expressExtension}            from './libs/express-extension';
import {authSchema,
        GraphqlAuthRoot,
        GraphqlRoot,
        schema}                      from './libs/graphql-root';
import R                             from './libs/r';
import {SessionStore}                from './libs/session-store';
import SocketManager                 from './libs/socket-manager';
import Utils                         from './libs/utils';
import {Session}                     from './models/session';
import Facebook                      from './provider/facebook';
import Github                        from './provider/github';
import Google                        from './provider/google';
import Twitter                       from './provider/twitter';

import bodyParser =       require('body-parser');
import compression =      require('compression');
import cookieParser =     require('cookie-parser');
import express =          require('express');
import expressDomain =    require('express-domain-middleware');
import graphqlHTTP =      require('express-graphql');
import session =          require('express-session');
import fs =               require('fs');
import helmet =           require('helmet');
import https =            require('https');
import log4js =           require('log4js');
import passport =         require('passport');
import passportFacebook = require('passport-facebook');
import passportGithub =   require('passport-github');
import passportGoogle =   require('passport-google-oauth');
import passportTwitter =  require('passport-twitter');

/**
 * イニシャライザ
 */
class Initializer
{
    private app : express.Express;

    /**
     * 初期化
     */
    async init(app : express.Express) : Promise<void>
    {
        Config.load();
        R     .load();
        loadCss();

        await MongoDB.init();
        await MySQL  .init();
        Authy        .init();

        this.app = app;
        this.app.use(helmet.hidePoweredBy());
        this.app.use(helmet.noSniff());
        this.app.use(helmet.frameguard({action:'deny'}));
        this.app.use(helmet.xssFilter());
        this.app.use(helmet.noCache());
        this.app.use(compression({level:6}));
        this.app.use(express.static(Config.STATIC_DIR));    // 静的コンテンツの設定は最初に行う
        this.app.use(expressDomain);
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
        if (Config.hasTwitter())
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
        if (Config.hasFacebook())
        {
            const options : passportFacebook.StrategyOption =
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
        if (Config.hasGoogle())
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
        if (Config.hasGithub())
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
            saveUninitialized: false,
            store: new SessionStore()
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

        const googleOptions = {
//          accessType: 'offline',
//          prompt:     'consent',
            scope:      ['https://www.googleapis.com/auth/plus.login']
        };

        const authTwitter =  passport.authenticate('twitter');
        const authFacebook = passport.authenticate('facebook');
        const authGoogle =   passport.authenticate('google', googleOptions);
        const authGithub =   passport.authenticate('github');

        // const provider = ':provider(twitter|facebook|google)';   // TODO:delete

        this.app.get('/',       LoginApp .index);
        this.app.get('/signup', SignupApp.index);
        this.app.get('/about',  AboutApp .index);
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

        this.app.get('/users/:id', UserApp .index);
        this.app.get('/users',     UsersApp.index);

        // APIs
//      this.app.post(  `/api/signup/${provider}`,   SignupApi.onSignupProvider);   // TODO:delete
        this.app.post(  '/api/signup/email',         SignupApi.onSignupEmail);
        this.app.post(  '/api/signup/email/confirm', SignupApi.onConfirmSignupEmail);
        this.app.post(  '/api/join',                 SignupApi.onJoin);
//      this.app.post(  `/api/login/${provider}`,    LoginApi .onLoginProvider);    // TODO:delete
        this.app.post(  '/api/login/email',          LoginApi .onLoginEmail);
        this.app.post(  '/api/login/sms',            LoginApi .onLoginSms);
        this.app.get(   '/api/login/authy/onetouch', LoginApi .onLoginAuthyOneTouch);
        this.app.post(  '/api/reset',                ResetApi .onRequestResetPassword);
        this.app.put(   '/api/reset/change',         ResetApi .onResetPassword);
        this.app.get(   '/api/user',                 UserApi  .onGetUser);
        this.app.get(   '/api/users',                UserApi  .onGetUserList);

        this.app.get(   '/api/settings/account',                           SettingsApi.onGetAccount);
        this.app.get(   '/api/settings/account/username',     Access.auth, SettingsApi.onCheckUserName);
        this.app.put(   '/api/settings/account',              Access.auth, SettingsApi.onSetAccount);
        this.app.delete('/api/settings/account',              Access.auth, SettingsApi.onDeleteAccount);
        this.app.put(   `/api/settings/account/unlink`,       Access.auth, SettingsApi.onUnlinkProvider);
        this.app.put(   '/api/settings/account/email',        Access.auth, SettingsApi.onRequestChangeEmail);
        this.app.put(   '/api/settings/account/email/change',              SettingsApi.onChangeEmail);
        this.app.put(   '/api/settings/account/password',     Access.auth, SettingsApi.onChangePassword);
        this.app.post(  '/api/settings/invite',               Access.auth, SettingsApi.onInvite);
        this.app.post(  '/api/logout',                        Access.auth, LogoutApi  .onLogout);

        this.app.get('/auth/twitter/callback',  Twitter .customCallback, Twitter .callback);
        this.app.get('/auth/facebook/callback', Facebook.customCallback, Facebook.callback);
        this.app.get('/auth/google/callback',   Google  .customCallback, Google  .callback);
        this.app.get('/auth/github/callback',   Github  .customCallback, Github  .callback);

        this.app.use('/graphql', graphqlHTTP({
            schema,
            rootValue: GraphqlRoot,
            graphiql: (process.env.NODE_ENV === 'development'),
        }));

        this.app.use('/graphql-auth', Access.auth);
        this.app.use('/graphql-auth', graphqlHTTP({
            schema: authSchema,
            rootValue: GraphqlAuthRoot,
            graphiql: (process.env.NODE_ENV === 'development'),
        }));

        this.app.use(Access.notFound);
    }
}

/**
 * main
 */
async function main()
{
    if (process.env.NODE_ENV === 'development') {
        process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
    }

//  slog.setConfig( 'ws://localhost:8080', 'webServiceTemplate.log', 'ALL', 'slog', 'gols');
    slog.setConfig('wss://localhost:8443', 'webServiceTemplate.log', 'ALL', 'slog', 'gols');

    const logger = log4js.getLogger();
    logger.level = 'debug';

    slog.bind(
        logger.debug.bind(logger),
        logger.info .bind(logger),
        logger.warn .bind(logger),
        logger.error.bind(logger));

    const log = slog.stepIn('app.ts', 'main');
    const app = express();
    const init = new Initializer();

    await init.init(app);
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
function command(command_id : string) : express.Handler
{
    const handler = async (req : express.Request, res : express.Response, next : express.NextFunction) =>
    {
        const log = slog.stepIn('app.ts', 'command');
        log.d(command_id);

        try
        {
            const _session : Session = req.ext.session;
            _session.command_id = command_id;
            await SessionAgent.update(_session);

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
    const appPort = process.env.APP_PORT || Config.APP_PORT;
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
            server = https.createServer(options, app).listen(appPort);
        }
        catch (err)
        {
            log.w(err.stack);
            console.error(err.stack);
        }
    }
    else
    {
        server = app.listen(appPort);
    }

    console.log('URL ........ ' + Utils.generateUrl(''));

    if (server === null)
    {
        setTimeout(() => process.exit(), 3000);
    }
    else
    {
        SocketManager.listen(server);
    }

    log.stepOut();
}

main();
