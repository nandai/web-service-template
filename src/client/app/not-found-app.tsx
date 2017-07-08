/**
 * (C) 2016-2017 printf.jp
 */
import * as React   from 'react';

import {App}        from 'client/app/app';
import NotFoundView from 'client/components/views/not-found-view';

/**
 * not found app
 */
export default class NotFoundApp extends App
{
    /**
     * view
     */
    view() : JSX.Element
    {
        return <NotFoundView />;
    }
}
