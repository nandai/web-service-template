/**
 * (C) 2016-2017 printf.jp
 */
import * as React    from 'react';
import ForbiddenView from '../components/views/forbidden-view';
import {App}         from './app';

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
