/**
 * (C) 2016-2017 printf.jp
 */
import * as React   from 'react';

import {App}        from 'client/app/app';
import NotFoundView from 'client/components/views/not-found-view';
import Utils        from 'client/libs/utils';
import {BaseStore}  from '../components/views/base-store';

const ssrStore = Utils.getSsrStore<BaseStore>();

/**
 * not found app
 */
export default class NotFoundApp extends App
{
    private store : BaseStore;

    /**
     * @constructor
     */
    constructor()
    {
        super();
        this.store = ssrStore;
    }

    /**
     * view
     */
    view() : JSX.Element
    {
        return <NotFoundView />;
    }
}
