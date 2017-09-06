/**
 * (C) 2016-2017 printf.jp
 */
import * as React   from 'react';

import {App}        from 'client/app/app';
import NotFoundView from 'client/components/views/not-found-view';
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
    constructor(ssrStore : BaseStore)
    {
        super();

        this.store = ssrStore;
        this.url = '404';
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
