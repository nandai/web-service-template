/**
 * (C) 2016-2017 printf.jp
 */
import bind                 from 'bind-decorator';
import * as React           from 'react';

import {App}                from 'client/app/app';
import Apps                 from 'client/app/apps';
import HomeView             from 'client/components/views/home-view';
import {storeNS}            from 'client/components/views/home-view/store';
import History, {Direction} from 'client/libs/history';
import {pageNS}             from 'client/libs/page';
import Utils                from 'client/libs/utils';
import {slog}               from 'libs/slog';
import AboutApp             from './about-app';
import LoginApp             from './login-app';
import SignupApp            from './signup-app';

/**
 * home app
 */
export default class HomeApp extends App
{
    private static CLS_NAME = 'HomeApp';
    store   : storeNS.Store;
    subApps :
    {
        login  : LoginApp;
        signup : SignupApp;
        about  : AboutApp;
    };

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
        this.store.onLogin =  this.onLogin;
        this.store.onSignup = this.onSignup;
        this.store.onAbout =  this.onAbout;

        this.subApps =
        {
            login:  new LoginApp( this.store.loginStore),
            signup: new SignupApp(this.store.signupStore),
            about:  new AboutApp( this.store.aboutStore)
        };

        for (const name in this.subApps)
        {
            const subApp : App = this.subApps[name];
            const {page} = subApp.store;
            page.active = false;
            page.onPageTransitionEnd = this.onPageTransitionEnd;
        }

        this.setName(this.store.name);
    }

    /**
     * toString
     */
    toString() : string
    {
        return 'HomeApp';
    }

    /**
     * 初期化
     */
    init(params, message? : string)
    {
        document.cookie = 'command=; expires=Thu, 01 Jan 1970 00:00:00 GMT';

        for (const name in this.subApps)
        {
            const subApp : App = this.subApps[name];
            subApp.init(params, message);
        }

        this.setName(this.pathnameToName());
        return super.init(params);
    }

    /**
     * view
     */
    view(i : number) : JSX.Element
    {
        return <HomeView key={i} store={this.store} apps={this.apps} />;
    }

    /**
     *
     */
    private pathnameToName() : storeNS.Name
    {
        const convert : {[pathname : string] : storeNS.Name} =
        {
            '/':       'login',
            '/signup': 'signup',
            '/about':  'about'
        };

        const {pathname} = location;
        return convert[pathname];
    }

    /**
     *
     */
    private getSubAppIndex(name : string)
    {
        let i = 0;
        for (const key in this.subApps)
        {
            if (key === name) {
                return i;
            }
            i++;
        }
        return -1;
    }

    /**
     *
     */
    private setName(name : storeNS.Name = 'login')
    {
        const {store} = this;
        const app = this.subApps[name];

        if (! this.apps)
        {
            // 初回設定時
            app.store.page.active = true;
            this.apps = new Apps(app);
        }
        else
        {
            // 二度目以降
            if (store.name !== name)
            {
                const i = this.getSubAppIndex(store.name);
                const j = this.getSubAppIndex(name);
                const direction : Direction = (i < j ? 'forward' : 'back');

                for (const name2 in this.subApps)
                {
                    const subApp : App = this.subApps[name2];
                    const {page} = subApp.store;
                    page.direction = direction;
                }

                this.apps.setNextApp(app);

                setTimeout(() =>
                {
                    this.apps.setActiveNextApp();
                    App.render();
                }, this.apps.getEffectDelay());
            }
        }

        store.name = name;
    }

    /**
     * onLogin
     */
    @bind
    private onLogin() : void
    {
        const log = slog.stepIn(HomeApp.CLS_NAME, 'onLogin');
        History.replaceState('/');
        log.stepOut();
    }

    /**
     * onSignup
     */
    @bind
    private onSignup() : void
    {
        const log = slog.stepIn(HomeApp.CLS_NAME, 'onSignup');
        History.replaceState('/signup');
        log.stepOut();
    }

    /**
     * onAbout
     */
    @bind
    private onAbout() : void
    {
        const log = slog.stepIn(HomeApp.CLS_NAME, 'onAbout');
        History.replaceState('/about');
        log.stepOut();
    }

    /**
     * ページ遷移終了イベント
     */
    @bind
    onPageTransitionEnd(page : pageNS.Page)
    {
        if (this.apps.changeDisplayStatus(page)) {
            App.render();
        }
    }
}
