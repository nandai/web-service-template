/**
 * (C) 2016-2017 printf.jp
 */
import bind               from 'bind-decorator';
import * as React         from 'react';

import SettingsApi        from 'client/api/settings-api';
import {App}              from 'client/app/app';
import SettingsInviteView from 'client/components/views/settings-invite-view';
import {storeNS}          from 'client/components/views/settings-invite-view/store';
import R                  from 'client/libs/r';
import Utils              from 'client/libs/utils';
import {Response}         from 'libs/response';
import {slog}             from 'libs/slog';

/**
 * settings invite app
 */
export default class SettingsInviteApp extends App
{
    private static CLS_NAME = 'SettingsInviteApp';
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
        this.url = '/settings/invite';
        this.auth = true;
        this.title = R.text(R.SETTINGS_INVITE, this.store.locale);

        this.store.onEmailChange = this.onEmailChange;
        this.store.onInvite =      this.onInvite;
        this.store.onBack =        this.onBack;
    }

    /**
     * toString
     */
    toString() : string
    {
        return 'SettingsInviteApp';
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
    view(i : number) : JSX.Element
    {
        return <SettingsInviteView key={i} store={this.store} />;
    }

    /**
     * onEmailChange
     */
    @bind
    private onEmailChange(value : string) : void
    {
        this.store.email = value;
        App.render();
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
        App.render();

        try
        {
            const {email} = store;

            const res : Response.Invite = await SettingsApi.invite({email});
            store.inviteResponse = res;
            store.loading = false;
            App.render();
            log.stepOut();
        }
        catch (err)
        {
            store.message = err.message;
            store.loading = false;
            App.render();
            log.stepOut();
        }
    }
}
