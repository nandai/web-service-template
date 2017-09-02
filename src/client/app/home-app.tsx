/**
 * (C) 2016-2017 printf.jp
 */
import bind        from 'bind-decorator';
import * as React  from 'react';

import {App}       from 'client/app/app';
import HomeView    from 'client/components/views/home-view';
import {storeNS}   from 'client/components/views/home-view/store';
import {pageNS}    from 'client/libs/page';
import Utils       from 'client/libs/utils';
import ForgetApp   from './forget-app';
import HomeTabsApp from './home-tabs-app';

/**
 * home app
 */
export default class HomeApp extends App
{
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
        this.appsOptions = {effectDelay:500};

        this.subApps =
        [
            new HomeTabsApp(this.store.homeTabsStore),
            new ForgetApp(  this.store.forgetStore)
        ];

        this.initSubApps();
    }

    /**
     *
     */
    initSubApps() : void
    {
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
     * view
     */
    view(i : number) : JSX.Element
    {
        return <HomeView key={i} store={this.store} apps={this.apps} />;
    }

    /**
     * ページ遷移終了イベント
     */
    @bind
    private onPageTransitionEnd(page : pageNS.Page)
    {
        if (this.apps.changeDisplayStatus(page)) {
            App.render();
        }
    }
}
