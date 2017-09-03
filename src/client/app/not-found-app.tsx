/**
 * (C) 2016-2017 printf.jp
 */
import * as React   from 'react';

import {App}        from 'client/app/app';
import NotFoundView from 'client/components/views/not-found-view';
import R            from 'client/libs/r';
import Utils        from 'client/libs/utils';
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
    constructor(ssrStore? : BaseStore)
    {
        super();

        if (! ssrStore) {
            ssrStore = Utils.getSsrStore<BaseStore>();
        }

        this.store = ssrStore;
        this.url = '404';
        this.query = null;
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
     * view
     */
    view(i : number) : JSX.Element
    {
        return <NotFoundView key={i} store={this.store} />;
    }
}
