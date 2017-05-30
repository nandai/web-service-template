/**
 * (C) 2016-2017 printf.jp
 */
import * as React         from 'react';

import {Response}         from 'libs/response';
import SettingsApi        from '../api/settings-api';
import SettingsInviteView from '../components/views/settings-invite-view';
import {Store}            from '../components/views/settings-invite-view/store';
import Utils              from '../libs/utils';
import {App}              from './app';

const slog = window['slog'];
const ssrStore = Utils.getSsrStore<Store>();

/**
 * settings invite app
 */
export default class SettingsInviteApp extends App
{
    private static CLS_NAME = 'SettingsInviteApp';
    private store : Store;

    /**
     * @constructor
     */
    constructor()
    {
        super();
        this.store =
        {
            locale:          Utils.getLocale(),
            account:         ssrStore.account,
            email:           ssrStore.email,
            onEmailChange:   this.onEmailChange.bind(this),
            onInvite:        this.onInvite.     bind(this),
            onBack:          this.onBack.       bind(this)
        };
    }

    /**
     * 初期化
     */
    init(params, message? : string)
    {
        const {store} = this;
        store.email =   '';
        store.message = '';
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
    private onEmailChange(e : React.ChangeEvent<HTMLInputElement>) : void
    {
        this.store.email = e.target.value;
        this.render();
    }

    /**
     * onInvite
     */
    private async onInvite()
    {
        const log = slog.stepIn(SettingsInviteApp.CLS_NAME, 'onInvite');
        const {store} = this;

        try
        {
            const {email} = store;

            const res : Response.Invite = await SettingsApi.invite({email});
            store.message = res.message;
            this.render();
            log.stepOut();
        }
        catch (err)
        {
            store.message = err.message;
            this.render();
            log.stepOut();
        }
    }
}
