/**
 * (C) 2016-2017 printf.jp
 */
import * as React   from 'react';

import {App}        from 'client/app/app';
import NotFoundView from 'client/components/views/not-found-view';
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
    constructor()
    {
        super();

        const ssrStore = Utils.getSsrStore<BaseStore>();
        this.store = ssrStore;
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
