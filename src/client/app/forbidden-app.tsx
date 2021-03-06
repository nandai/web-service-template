/**
 * (C) 2016-2017 printf.jp
 */
import * as React    from 'react';

import {App}         from 'client/app/app';
import ForbiddenView from 'client/components/views/forbidden-view';
import {storeNS}     from 'client/components/views/forbidden-view/store';
import R             from 'client/libs/r';
import {BaseStore}   from '../components/views/base-store';

/**
 * forbidden app
 */
export default class ForbiddenApp extends App
{
    store : BaseStore;

    /**
     * @constructor
     */
    constructor(ssrStore : BaseStore)
    {
        super();

        this.store = storeNS.init(ssrStore);
        this.url = '403';
        this.title = R.text(R.FORBIDDEN, this.store.locale);
    }

    /**
     * toString
     */
    toString() : string
    {
        return 'ForbiddenApp';
    }

    /**
     * factory
     */
    factory(store : BaseStore) : App
    {
        return new ForbiddenApp(store);
    }

    /**
     * view
     */
    view(i : number) : JSX.Element
    {
        return <ForbiddenView key={i} store={this.store} />;
    }
}
