/**
 * (C) 2016-2017 printf.jp
 */
import * as React          from 'react';
import {App}               from './app';
import SettingsApi         from '../api/settings-api';
import SettingsAccountView from '../components/views/settings-account-view/settings-account-view';
import {Store}             from '../components/views/settings-account-view/store';
import Utils               from '../libs/utils';

const slog = window['slog'];
const ssrStore : Store = window['ssrStore'];

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
            onNameChange:    this.onNameChange.   bind(this),
            onPhoneNoChange: this.onPhoneNoChange.bind(this),
            onChange:        this.onChange.       bind(this),
            onBack:          this.onBack.         bind(this)
        };
    }

    /**
     * 初期化
     */
    init() : void
    {
        const {store} = this;
        store.message = '';
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
     * onChange
     */
    private async onChange()
    {
        const log = slog.stepIn(SettingsAccountApp.CLS_NAME, 'onChange');
        const {store} = this;

        try
        {
            const {account} = store;
            const {name, phoneNo} = account;

            const res = await SettingsApi.setAccount({name, phoneNo});
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
