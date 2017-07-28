/**
 * (C) 2016-2017 printf.jp
 */
import bind               from 'bind-decorator';
import * as React         from 'react';

import SettingsApi        from 'client/api/settings-api';
import {App}              from 'client/app/app';
import SettingsInviteView from 'client/components/views/settings-invite-view';
import {storeNS}          from 'client/components/views/settings-invite-view/store';
import Utils              from 'client/libs/utils';
import {Response}         from 'libs/response';
import {slog}             from 'libs/slog';

const ssrStore = Utils.getSsrStore<storeNS.Store>();

/**
 * settings invite app
 */
export default class SettingsInviteApp extends App
{
    private static CLS_NAME = 'SettingsInviteApp';
    private store : storeNS.Store;

    /**
     * @constructor
     */
    constructor()
    {
        super();
        this.store = storeNS.init(ssrStore);
        this.store.onEmailChange = this.onEmailChange;
        this.store.onInvite =      this.onInvite;
        this.store.onBack =        this.onBack;
    }

    /**
     * 初期化
     */
    init(params, _message? : string)
    {
        this.store = storeNS.init(this.store);
        return super.init(params);
    }

    /**
     * view
     */
    view() : JSX.Element
    {
        return <SettingsInviteView store={this.store} />;
    }

    /**
     * onEmailChange
     */
    @bind
    private onEmailChange(value : string) : void
    {
        this.store.email = value;
        this.render();
    }

    /**
     * onInvite
     */
    @bind
    private async onInvite()
    {
        const log = slog.stepIn(SettingsInviteApp.CLS_NAME, 'onInvite');
        const {store} = this;

        store.message = '';
        store.inviteResponse.message = {};
        store.loading = true;
        this.render();

        try
        {
            const {email} = store;

            const res : Response.Invite = await SettingsApi.invite({email});
            store.inviteResponse = res;
            store.loading = false;
            this.render();
            log.stepOut();
        }
        catch (err)
        {
            store.message = err.message;
            store.loading = false;
            this.render();
            log.stepOut();
        }
    }
}
