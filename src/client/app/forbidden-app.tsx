/**
 * (C) 2016-2017 printf.jp
 */
import * as React    from 'react';

import {App}         from 'client/app/app';
import ForbiddenView from 'client/components/views/forbidden-view';
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

        this.store = ssrStore;
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
     * view
     */
    view(i : number) : JSX.Element
    {
        return <ForbiddenView key={i} store={this.store} />;
    }
}
