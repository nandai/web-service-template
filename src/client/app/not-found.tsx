/**
 * (C) 2016-2017 printf.jp
 */
import * as React   from 'react';
import {App}        from './app';
import NotFoundView from '../components/views/not-found-view/not-found-view';

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
