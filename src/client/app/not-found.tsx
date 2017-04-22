/**
 * (C) 2016-2017 printf.jp
 */
import * as React    from 'react';
import * as ReactDOM from 'react-dom';
import {App}         from './app';
import NotFoundView  from '../components/views/not-found-view/not-found-view';

/**
 * not found app
 */
export default class NotFoundApp extends App
{
    /**
     * render
     */
    render() : void
    {
        ReactDOM.render(
            <NotFoundView />,
            document.getElementById('root'));
    }
}
