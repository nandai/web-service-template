/**
 * (C) 2016-2017 printf.jp
 */
import bind       from 'bind-decorator';
import * as React from 'react';

import LogoutApi  from 'client/api/logout-api';
import {App}      from 'client/app/app';
import TopView    from 'client/components/views/top-view';
import {storeNS}  from 'client/components/views/top-view/store';
import History    from 'client/libs/history';
import R          from 'client/libs/r';
import Utils      from 'client/libs/utils';
import {slog}     from 'libs/slog';

/**
 * top App
 */
export default class TopApp extends App
{
    private static CLS_NAME = 'TopApp';
    store : storeNS.Store;

    /**
     * @constructor
     */
    constructor(ssrStore? : storeNS.Store)
    {
        super();

        if (! ssrStore) {
            ssrStore = Utils.getSsrStore<storeNS.Store>();
        }

        this.store = storeNS.init(ssrStore);
        this.url = '/';
        this.title = R.text(R.TOP, this.store.locale);

        this.store.onSettings = this.onSettings;
        this.store.onInvite =   this.onInvite;
        this.store.onUsers =    this.onUsers;
        this.store.onLogout =   this.onLogout;
    }

    /**
     * toString
     */
    toString() : string
    {
        return 'TopApp';
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
    view(i : number) : JSX.Element
    {
        return <TopView key={i} store={this.store} />;
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
            App.render();
            log.stepOut();
        }
    }
}
