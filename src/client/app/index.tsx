/**
 * (C) 2016-2017 printf.jp
 */
import * as React    from 'react';
import * as ReactDOM from 'react-dom';
import LogoutApi     from '../api/logout-api';
import {Store}       from '../components/views/top-view/store';
import TopView       from '../components/views/top-view/top-view';
import Utils         from '../libs/utils';

const slog =  window['slog'];

class TopApp
{
    private static CLS_NAME = 'TopApp';
    private store : Store;

    /**
     * @constructor
     */
    constructor()
    {
        this.store =
        {
            locale:     Utils.getLocale(),
            message:    '',
            onSettings: this.onSettings.bind(this),
            onLogout:   this.onLogout.  bind(this)
        };
    }

    /**
     * render
     */
    render() : void
    {
        ReactDOM.render(
            <TopView store={this.store} />,
            document.getElementById('root'));
    }

    /**
     * onSettings
     */
    private onSettings() : void
    {
        const log = slog.stepIn(TopApp.CLS_NAME, 'onSettings');
        window.location.href = '/settings';
        log.stepOut();
    }

    /**
     * onLogout
     */
    private async onLogout()
    {
        const log = slog.stepIn(TopApp.CLS_NAME, 'onLogout');
        try
        {
            await LogoutApi.logout();
            location.href = '/';
            log.stepOut();
        }
        catch (err)
        {
            this.store.message = err.message;
            this.render();
            log.stepOut();
        }
    }
}

window.addEventListener('DOMContentLoaded', () => {
    const app = new TopApp();
    app.render();
});

window.history.pushState('', document.title, window.location.pathname);
