/**
 * (C) 2016-2017 printf.jp
 */
import bind           from 'bind-decorator';
import * as React     from 'react';

import {App}          from 'client/app/app';
import {HomeTabsView} from 'client/components/views/home-tabs-view';
import {storeNS}      from 'client/components/views/home-tabs-view/store';
import History        from 'client/libs/history';
import Utils          from 'client/libs/utils';
import {slog}         from 'libs/slog';
import AboutApp       from './about-app';
import LoginApp       from './login-app';
import SignupApp      from './signup-app';

/**
 * home app
 */
export default class HomeTabsApp extends App
{
    private static CLS_NAME = 'HomeTabsApp';
    store : storeNS.Store;

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

        this.childApps =
        [
            new LoginApp( this.store.loginStore),
            new SignupApp(this.store.signupStore),
            new AboutApp( this.store.aboutStore)
        ];

        this.initSubApps();
    }

    /**
     *
     */
    initSubApps() : void
    {
        for (const childApp of this.childApps)
        {
            const {page} = childApp.store;
            page.active = false;
            page.onPageTransitionEnd = this.onPageTransitionEnd;
        }
    }

    /**
     * toString
     */
    toString() : string
    {
        return 'HomeTabsApp';
    }

    /**
     * 初期化
     */
    init(params, message? : string)
    {
        document.cookie = 'command=; expires=Thu, 01 Jan 1970 00:00:00 GMT';
        return super.init(params, message);
    }

    /**
     * view
     */
    view(i : number) : JSX.Element
    {
        return <HomeTabsView key={i} store={this.store} apps={this.apps} />;
    }

    /**
     * onLogin
     */
    @bind
    private onLogin() : void
    {
        const log = slog.stepIn(HomeTabsApp.CLS_NAME, 'onLogin');
        History.replaceState('/');
        log.stepOut();
    }

    /**
     * onSignup
     */
    @bind
    private onSignup() : void
    {
        const log = slog.stepIn(HomeTabsApp.CLS_NAME, 'onSignup');
        History.replaceState('/signup');
        log.stepOut();
    }

    /**
     * onAbout
     */
    @bind
    private onAbout() : void
    {
        const log = slog.stepIn(HomeTabsApp.CLS_NAME, 'onAbout');
        History.replaceState('/about');
        log.stepOut();
    }
}
