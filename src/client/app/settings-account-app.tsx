/**
 * (C) 2016-2017 printf.jp
 */
import bind                from 'bind-decorator';
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
            onNameChange:        this.onNameChange,
            onUserNameChange:    this.onUserNameChange,
            onPhoneNoChange:     this.onPhoneNoChange,
            onTwoFactorAuth:     this.onTwoFactorAuth,
            onCountryCodeChange: this.onCountryCodeChange,
            onChange:            this.onChange,
            onBack:              this.onBack,
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
    @bind
    private onNameChange(value : string) : void
    {
        this.store.account.name = value;
        this.render();
    }

    /**
     * onUserNameChange
     */
    @bind
    private onUserNameChange(value : string) : void
    {
        this.store.account.userName = value;
        this.render();
    }

    /**
     * onPhoneNoChange
     */
    @bind
    private onPhoneNoChange(value : string) : void
    {
        this.store.account.phoneNo = value;
        this.render();
    }

    /**
     * onCountryCodeChange
     */
    @bind
    private onCountryCodeChange(value : string) : void
    {
        this.store.account.countryCode = value;
        this.render();
    }

    /**
     * onTwoFactorAuth
     */
    @bind
    private onTwoFactorAuth(twoFactorAuth : string) : void
    {
        this.store.account.twoFactorAuth = twoFactorAuth;
        this.render();
    }

    /**
     * onChange
     */
    @bind
    private async onChange()
    {
        const log = slog.stepIn(SettingsAccountApp.CLS_NAME, 'onChange');
        const {store} = this;

        try
        {
            const {account} = store;
            const {name, userName, countryCode, phoneNo, twoFactorAuth} = account;

            const res : Response.SetAccount = await SettingsApi.setAccount({name, userName, countryCode, phoneNo, twoFactorAuth});
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
