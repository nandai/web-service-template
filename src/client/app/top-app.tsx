/**
 * (C) 2016-2017 printf.jp
 */
import bind       from 'bind-decorator';
import * as React from 'react';

import LogoutApi  from '../api/logout-api';
import TopView    from '../components/views/top-view';
import {Store}    from '../components/views/top-view/store';
import History    from '../libs/history';
import Utils      from '../libs/utils';
import {App}      from './app';

const slog = window['slog'];
const ssrStore = Utils.getSsrStore<Store>();

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
            message:    ssrStore.message,
            onSettings: this.onSettings,
            onInvite:   this.onInvite,
            onUsers:    this.onUsers,
            onLogout:   this.onLogout,
        };
    }

    /**
     * 初期化
     */
    init(params, message? : string)
    {
        const {store} = this;
        store.message =  message || '';
        return super.init(params);
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
    @bind
    private onSettings() : void
    {
        const log = slog.stepIn(TopApp.CLS_NAME, 'onSettings');
        History.pushState('/settings');
        log.stepOut();
    }

    /**
     * onInvite
     */
    @bind
    private onInvite() : void
    {
        const log = slog.stepIn(TopApp.CLS_NAME, 'onInvite');
        History.pushState('/settings/invite');
        log.stepOut();
    }

    /**
     * onUsers
     */
    @bind
    private onUsers() : void
    {
        const log = slog.stepIn(TopApp.CLS_NAME, 'onUsers');
        History.pushState('/users');
        log.stepOut();
    }

    /**
     * onLogout
     */
    @bind
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
