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
    subApps : {[url : string] : App};

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
            '/':       new LoginApp( this.store.loginStore),
            '/signup': new SignupApp(this.store.signupStore),
            '/about':  new AboutApp( this.store.aboutStore)
        };

        for (const name in this.subApps)
        {
            const subApp : App = this.subApps[name];
            const {page} = subApp.store;
            page.active = false;
            page.onPageTransitionEnd = this.onPageTransitionEnd;
        }

        this.setUrl(this.store.url);
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

        this.setUrl(location.pathname);
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
    private setUrl(url : string)
    {
        const {store} = this;
        const app = this.subApps[url];

        if (! this.apps)
        {
            // 初回設定時
            app.store.page.active = true;
            this.apps = new Apps(app);
        }
        else
        {
            // 二度目以降
            if (store.url !== url)
            {
                const i = this.getSubAppIndex(store.url);
                const j = this.getSubAppIndex(url);
                const direction : Direction = (i < j ? 'forward' : 'back');

                for (const url2 in this.subApps)
                {
                    const subApp : App = this.subApps[url2];
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

        store.url = url;
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
