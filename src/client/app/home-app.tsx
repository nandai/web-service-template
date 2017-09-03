/**
 * (C) 2016-2017 printf.jp
 */
import * as React  from 'react';

import {App}       from 'client/app/app';
import HomeView    from 'client/components/views/home-view';
import {storeNS}   from 'client/components/views/home-view/store';
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

        this.childApps =
        [
            new HomeTabsApp(this.store.homeTabsStore),
            new ForgetApp(  this.store.forgetStore)
        ];

        this.initSubApps();
        this.setUrl(this.store.url);
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
        return 'HomeApp';
    }

    /**
     * view
     */
    view(i : number) : JSX.Element
    {
        return <HomeView key={i} store={this.store} apps={this.apps} />;
    }
}
