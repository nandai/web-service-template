/**
 * (C) 2016-2017 printf.jp
 */
import * as React  from 'react';

import {App}       from 'client/app/app';
import HomeView    from 'client/components/views/home-view';
import {storeNS}   from 'client/components/views/home-view/store';
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
    constructor(ssrStore : storeNS.Store)
    {
        super();

        this.store = storeNS.init(ssrStore);
        this.pageTransitionOptions = {effectDelay:500};

        this.childApps =
        [
            new HomeTabsApp(ssrStore),
            new ForgetApp(  ssrStore)
        ];

        this.initChildApps();
    }

    /**
     * toString
     */
    toString() : string
    {
        return 'HomeApp';
    }

    /**
     * factory
     */
    factory(store : storeNS.Store) : App
    {
        return new HomeApp(store);
    }

    /**
     * view
     */
    view(i : number) : JSX.Element
    {
        return <HomeView key={i} store={this.store} pageTransition={this.pageTransition} />;
    }
}
