/**
 * (C) 2016-2017 printf.jp
 */
import * as React  from 'react';

import {App}       from 'client/app/app';
import {BaseStore} from 'client/components/views/base-store';
import AboutView   from 'client/components/views/home-view/about-view';

export default class AboutApp extends App
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
    view(i : number) : JSX.Element
    {
        return <AboutView key={i} store={this.store} />;
    }
}
