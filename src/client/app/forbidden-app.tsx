/**
 * (C) 2016-2017 printf.jp
 */
import * as React    from 'react';

import {App}         from 'client/app/app';
import ForbiddenView from 'client/components/views/forbidden-view';

/**
 * forbidden app
 */
export default class ForbiddenApp extends App
{
    /**
     * view
     */
    view() : JSX.Element
    {
        return <ForbiddenView />;
    }
}
