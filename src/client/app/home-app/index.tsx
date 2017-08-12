/**
 * (C) 2016-2017 printf.jp
 */
import bind                 from 'bind-decorator';
import * as React           from 'react';

import {App}                from 'client/app/app';
import Apps                 from 'client/app/apps';
import {BaseStore}          from 'client/components/views/base-store';
import LoginView            from 'client/components/views/login-view';
import {storeNS}            from 'client/components/views/login-view/store';
import History, {Direction} from 'client/libs/history';
import Utils                from 'client/libs/utils';
import {Response}           from 'libs/response';
import {slog}               from 'libs/slog';
import LoginApp             from './login-app';

/**
 * home app
 */
export default class HomeApp extends App
{
    private static CLS_NAME = 'HomeApp';
    store    : storeNS.Store;
    loginApp : LoginApp;
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
        this.store.onLogin = this.onLogin;
        this.store.onAbout = this.onAbout;

        this.loginApp = new LoginApp(this.store.loginStore);
        this.aboutApp = new AboutApp(this.store.aboutStore);

        this.store.loginStore.page.active = false;
        this.store.aboutStore.page.active = false;

        this.store.loginStore.page.onPageTransitionEnd = this.onPageTransitionEnd;
        this.store.aboutStore.page.onPageTransitionEnd = this.onPageTransitionEnd;

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
    init(params, _message? : string)
    {
        document.cookie = 'command=; expires=Thu, 01 Jan 1970 00:00:00 GMT';

        const store = this.store.loginStore;
        store.message =  '';
        store.loginEmailResponse = {status:Response.Status.OK, message:{}};
        this.setName(location.pathname === '/' ? 'login' : 'about');
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
    private setName(name : 'login' | 'about')
    {
        const {store} = this;

        let app : App;
        let direction : Direction;

        if (name === 'login')
        {
            app = this.loginApp;
            direction = 'back';
        }
        else
        {
            app = this.aboutApp;
            direction = 'forward';
        }

        this.store.loginStore.page.direction = direction;
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
            if (store.name !== name)
            {
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
    onPageTransitionEnd(store : BaseStore)
    {
        if (this.apps.changeDisplayStatus(store)) {
            App.render();
        }
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
