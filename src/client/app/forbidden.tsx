/**
 * (C) 2016-2017 printf.jp
 */
import * as React    from 'react';
import {App}         from './app';
import ForbiddenView from '../components/views/forbidden-view/forbidden-view';

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
