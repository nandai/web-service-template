/**
 * (C) 2016-2017 printf.jp
 */
import * as React    from 'react';

import {App}         from 'client/app/app';
import ForbiddenView from 'client/components/views/forbidden-view';
import Utils         from 'client/libs/utils';
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
