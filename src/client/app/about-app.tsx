/**
 * (C) 2016-2017 printf.jp
 */
import * as React from 'react';

import {App}      from 'client/app/app';
import AboutView  from 'client/components/views/about-view';
import {storeNS}  from 'client/components/views/about-view/store';
import Utils      from 'client/libs/utils';

/**
 * about app
 */
export default class AboutApp extends App
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
