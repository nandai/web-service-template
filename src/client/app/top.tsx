/**
 * (C) 2016-2017 printf.jp
 */
import * as React from 'react';
import {App}      from './app';
import LogoutApi  from '../api/logout-api';
import {Store}    from '../components/views/top-view/store';
import TopView    from '../components/views/top-view/top-view';
import History    from '../libs/history';
import Utils      from '../libs/utils';

const slog = window['slog'];
const ssrStore : Store = window['ssrStore'];

/**
 * top App
 */
export default class TopApp extends App
{
    private static CLS_NAME = 'TopApp';
    private store : Store;

    /**
     * @constructor
     */
    constructor()
    {
        super();
        this.store =
        {
            locale:     Utils.getLocale(),
            account:    ssrStore.account,
            message:    '',
            onSettings: this.onSettings.bind(this),
            onUsers:    this.onUsers.   bind(this),
            onLogout:   this.onLogout.  bind(this)
        };
    }

    /**
     * view
     */
    view() : JSX.Element
    {
        return <TopView store={this.store} />;
    }

    /**
     * onSettings
     */
    private onSettings() : void
    {
        const log = slog.stepIn(TopApp.CLS_NAME, 'onSettings');
        History.pushState('/settings');
        log.stepOut();
    }

    /**
     * onUsers
     */
    private onUsers() : void
    {
        const log = slog.stepIn(TopApp.CLS_NAME, 'onUsers');
        History.pushState('/users');
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
            History.replaceState('/');
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
