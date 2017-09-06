/**
 * (C) 2016-2017 printf.jp
 */
import * as React from 'react';

import {App}      from 'client/app/app';
import AboutView  from 'client/components/views/about-view';
import {storeNS}  from 'client/components/views/about-view/store';
import R          from 'client/libs/r';

/**
 * about app
 */
export default class AboutApp extends App
{
    store : storeNS.Store;

    /**
     * @constructor
     */
    constructor(ssrStore : storeNS.Store)
    {
        super();

        this.store = storeNS.init(ssrStore);
        this.url = '/about';
        this.title = R.text(R.ABOUT, this.store.locale);
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
    view(i : number) : JSX.Element
    {
        return <AboutView key={i} store={this.store} />;
    }
}
