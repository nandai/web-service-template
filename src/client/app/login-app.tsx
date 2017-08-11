/**
 * (C) 2016-2017 printf.jp
 */
import bind                 from 'bind-decorator';
import * as React           from 'react';

import LoginApi             from 'client/api/login-api';
import {App}                from 'client/app/app';
import Apps                 from 'client/app/apps';
import {BaseStore}          from 'client/components/views/base-store';
import LoginView            from 'client/components/views/login-view';
import {storeNS}            from 'client/components/views/login-view/store';
import History, {Direction} from 'client/libs/history';
import Utils                from 'client/libs/utils';
import {Request}            from 'libs/request';
import {Response}           from 'libs/response';
import {slog}               from 'libs/slog';

/**
 * login app
 */
export default class LoginApp extends App
{
    private static CLS_NAME = 'LoginApp';
    store    : storeNS.Store;
    apps     : Apps;
    homeApp  : HomeApp;
    aboutApp : AboutApp;

    /**
     * @constructor
     */
    constructor(ssrStore? : storeNS.Store)
    {
        super();

        if (! ssrStore) {
            ssrStore = Utils.getSsrStore<storeNS.Store>();
        }

        this.store = storeNS.init(ssrStore);
        this.store.onHome =  this.onHome;
        this.store.onAbout = this.onAbout;

        this.homeApp =  new HomeApp( this.store.homeStore);
        this.aboutApp = new AboutApp(this.store.aboutStore);

        this.store.homeStore .page.active = false;
        this.store.aboutStore.page.active = false;

        this.store.homeStore .page.onPageTransitionEnd = this.onPageTransitionEnd;
        this.store.aboutStore.page.onPageTransitionEnd = this.onPageTransitionEnd;

        this.setName(this.store.name);
    }

    /**
     * toString
     */
    toString() : string
    {
        return 'LoginApp';
    }

    /**
     * 初期化
     */
    init(params, _message? : string)
    {
        document.cookie = 'command=; expires=Thu, 01 Jan 1970 00:00:00 GMT';

        const store = this.store.homeStore;
        store.message =  '';
        store.loginEmailResponse = {status:Response.Status.OK, message:{}};
        this.setName(location.pathname === '/' ? 'home' : 'about');
        return super.init(params);
    }

    /**
     * view
     */
    view(i : number) : JSX.Element
    {
        return <LoginView key={i} store={this.store} />;
    }

    /**
     *
     */
    private setName(name : 'home' | 'about')
    {
        const {store} = this;
        store.name = name;

        let app : App;
        let direction : Direction;

        if (name === 'home')
        {
            app = this.homeApp;
            direction = 'back';
        }
        else
        {
            app = this.aboutApp;
            direction = 'forward';
        }

        this.store.homeStore .page.direction = direction;
        this.store.aboutStore.page.direction = direction;

        if (! this.apps)
        {
            // 初回設定時
            app.store.page.active = true;
            this.apps = new Apps(app);
        }
        else
        {
            // 二度目以降
            this.apps.setNextApp(app);

            setTimeout(() =>
            {
                this.apps.setActiveNextApp();
                App.render();
            }, this.apps.getEffectDelay());
        }
    }

    /**
     * onHome
     */
    @bind
    private onHome() : void
    {
        const log = slog.stepIn(LoginApp.CLS_NAME, 'onHome');
        History.replaceState('/');
        log.stepOut();
    }

    /**
     * onAbout
     */
    @bind
    private onAbout() : void
    {
        const log = slog.stepIn(LoginApp.CLS_NAME, 'onAbout');
        History.replaceState('/about');
        log.stepOut();
    }

    /**
     * ページ遷移終了イベント
     */
    @bind
    onPageTransitionEnd(store : BaseStore)
    {
        if (this.apps.changeDisplayStatus(store)) {
            App.render();
        }
    }
}

class HomeApp extends App
{
    private static CLS_NAME = 'HomeApp';
    store : storeNS.HomeStore;

    /**
     * @constructor
     */
    constructor(store : storeNS.HomeStore)
    {
        super();

        this.store = store;
        this.store.onTwitter =        this.onTwitter;
        this.store.onFacebook =       this.onFacebook;
        this.store.onGoogle =         this.onGoogle;
        this.store.onGithub =         this.onGithub;
        this.store.onEmailChange =    this.onEmailChange;
        this.store.onPasswordChange = this.onPasswordChange;
        this.store.onLogin =          this.onLogin;
        this.store.onSignup =         this.onSignup;
        this.store.onForget =         this.onForget;
        this.store.onUsers =          this.onUsers;
    }

    /**
     * toString
     */
    toString() : string
    {
        return 'HomeApp';
    }

    /**
     * view
     */
    view(_i : number) : JSX.Element
    {
        return null;
    }

    /**
     * onTwitter
     */
    @bind
    private onTwitter() : void
    {
        const log = slog.stepIn(HomeApp.CLS_NAME, 'onTwitter');
        location.href = '/login/twitter';
        log.stepOut();
    }

    /**
     * onFacebook
     */
    @bind
    private onFacebook() : void
    {
        const log = slog.stepIn(HomeApp.CLS_NAME, 'onFacebook');
        location.href = '/login/facebook';
        log.stepOut();
    }

    /**
     * onGoogle
     */
    @bind
    private onGoogle() : void
    {
        const log = slog.stepIn(HomeApp.CLS_NAME, 'onGoogle');
        location.href = '/login/google';
        log.stepOut();
    }

    /**
     * onGithub
     */
    @bind
    private onGithub() : void
    {
        const log = slog.stepIn(HomeApp.CLS_NAME, 'onGithub');
        location.href = '/login/github';
        log.stepOut();
    }

    /**
     * onEmailChange
     */
    @bind
    private onEmailChange(value : string) : void
    {
        this.store.email = value;
        App.render();
    }

    /**
     * onPasswordChange
     */
    @bind
    private onPasswordChange(value : string) : void
    {
        this.store.password = value;
        App.render();
    }

    /**
     * onLogin
     */
    @bind
    private async onLogin()
    {
        const log = slog.stepIn(HomeApp.CLS_NAME, 'onLogin');
        try
        {
            const {email, password} = this.store;
            await this.login({email, password});
            log.stepOut();
        }
        catch (err) {log.stepOut();}
    }

    /**
     * onSignup
     */
    @bind
    private onSignup() : void
    {
        const log = slog.stepIn(HomeApp.CLS_NAME, 'onSignup');
        History.pushState('/signup');
        log.stepOut();
    }

    /**
     * onForget
     */
    @bind
    private onForget() : void
    {
        const log = slog.stepIn(HomeApp.CLS_NAME, 'onForget');
        History.pushState('/forget');
        log.stepOut();
    }

    /**
     * onUsers
     */
    @bind
    private onUsers() : void
    {
        const log = slog.stepIn(HomeApp.CLS_NAME, 'onUsers');
        History.pushState('/users');
        log.stepOut();
    }

    /**
     * login
     */
    private login(param : Request.LoginEmail)
    {
        return new Promise(async (resolve : () => void, reject) =>
        {
            const log = slog.stepIn(HomeApp.CLS_NAME, 'login');
            try
            {
                const res : Response.LoginEmail = await LoginApi.loginEmail(param);
                this.store.loginEmailResponse = res;

                if (res.status !== Response.Status.OK)
                {
                    App.render();
                }
                else
                {
                    if (res.smsId === undefined)
                    {
                        History.pushState('/', res.message.general);
                    }
                    else
                    {
                        History.pushState(`/?id=${res.smsId}`);
                    }
                }

                log.stepOut();
                resolve();
            }
            catch (err)
            {
                this.store.message = err.message;
                App.render();
                log.stepOut();
                reject();
            }
        });
    }
}

class AboutApp extends App
{
    store : BaseStore;

    /**
     * @constructor
     */
    constructor(store : BaseStore)
    {
        super();
        this.store = store;
    }

    /**
     * toString
     */
    toString() : string
    {
        return 'AboutApp';
    }

    /**
     * view
     */
    view(_i : number) : JSX.Element
    {
        return null;
    }
}
