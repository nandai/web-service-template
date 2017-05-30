/**
 * (C) 2016-2017 printf.jp
 */
import * as React          from 'react';

import {Response}          from 'libs/response';
import SettingsApi         from '../api/settings-api';
import SettingsAccountView from '../components/views/settings-account-view';
import {Store}             from '../components/views/settings-account-view/store';
import Utils               from '../libs/utils';
import {App}               from './app';

const slog = window['slog'];
const ssrStore = Utils.getSsrStore<Store>();

/**
 * settings account app
 */
export default class SettingsAccountApp extends App
{
    private static CLS_NAME = 'SettingsAccountApp';
    private store : Store;

    /**
     * @constructor
     */
    constructor()
    {
        super();
        this.store =
        {
            locale:   Utils.getLocale(),
            account:  ssrStore.account,
            message:  '',
            onNameChange:        this.onNameChange.       bind(this),
            onPhoneNoChange:     this.onPhoneNoChange.    bind(this),
            onTwoFactorAuth:     this.onTwoFactorAuth.    bind(this),
            onCountryCodeChange: this.onCountryCodeChange.bind(this),
            onChange:            this.onChange.           bind(this),
            onBack:              this.onBack.             bind(this)
        };
    }

    /**
     * 初期化
     */
    init(params, message? : string)
    {
        const {store} = this;
        store.message = '';
        return super.init(params);
    }

    /**
     * view
     */
    view() : JSX.Element
    {
        return <SettingsAccountView store={this.store} />;
    }

    /**
     * onNameChange
     */
    private onNameChange(e : React.ChangeEvent<HTMLInputElement>) : void
    {
        this.store.account.name = e.target.value;
        this.render();
    }

    /**
     * onPhoneNoChange
     */
    private onPhoneNoChange(e : React.ChangeEvent<HTMLInputElement>) : void
    {
        this.store.account.phoneNo = e.target.value;
        this.render();
    }

    /**
     * onCountryCodeChange
     */
    private onCountryCodeChange(e : React.ChangeEvent<HTMLInputElement>) : void
    {
        this.store.account.countryCode = e.target.value;
        this.render();
    }

    /**
     * onTwoFactorAuth
     */
    private onTwoFactorAuth(twoFactorAuth : string) : void
    {
        this.store.account.twoFactorAuth = twoFactorAuth;
        this.render();
    }

    /**
     * onChange
     */
    private async onChange()
    {
        const log = slog.stepIn(SettingsAccountApp.CLS_NAME, 'onChange');
        const {store} = this;

        try
        {
            const {account} = store;
            const {name, countryCode, phoneNo, twoFactorAuth} = account;

            const res : Response.SetAccount = await SettingsApi.setAccount({name, countryCode, phoneNo, twoFactorAuth});
            store.message = res.message;

            if (res.status === Response.Status.OK) {
                store.account = res.account;
            }

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
