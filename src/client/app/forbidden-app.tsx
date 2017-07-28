/**
 * (C) 2016-2017 printf.jp
 */
import * as React    from 'react';

import {App}         from 'client/app/app';
import ForbiddenView from 'client/components/views/forbidden-view';
import Utils         from 'client/libs/utils';
import {BaseStore}   from '../components/views/base-store';

const ssrStore = Utils.getSsrStore<BaseStore>();

/**
 * forbidden app
 */
export default class ForbiddenApp extends App
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
        return <ForbiddenView />;
    }
}
