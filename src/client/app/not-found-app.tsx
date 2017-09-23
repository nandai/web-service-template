/**
 * (C) 2016-2017 printf.jp
 */
import * as React   from 'react';

import {App}        from 'client/app/app';
import NotFoundView from 'client/components/views/not-found-view';
import {storeNS}    from 'client/components/views/not-found-view/store';
import R            from 'client/libs/r';
import {BaseStore}  from '../components/views/base-store';

/**
 * not found app
 */
export default class NotFoundApp extends App
{
    store : BaseStore;

    /**
     * @constructor
     */
    constructor(ssrStore : BaseStore, query = false)
    {
        super();

        this.store = storeNS.init(ssrStore);
        this.url = '404';
        this.query = query;
        this.title = R.text(R.NOT_FOUND, this.store.locale);
    }

    /**
     * toString
     */
    toString() : string
    {
        return 'NotFoundApp';
    }

    /**
     * factory
     */
    factory(store : BaseStore) : App
    {
        return new NotFoundApp(store);
    }

    /**
     * view
     */
    view(i : number) : JSX.Element
    {
        return <NotFoundView key={i} store={this.store} />;
    }
}
