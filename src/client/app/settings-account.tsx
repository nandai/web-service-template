/**
 * (C) 2016-2017 printf.jp
 */
import * as React          from 'react';
import * as ReactDOM       from 'react-dom';
import SettingsApi         from '../api/settings-api';
import SettingsAccountView from '../components/views/settings-account-view/settings-account-view';
import {Store}             from '../components/views/settings-account-view/store';
import Utils               from '../libs/utils';

const slog = window['slog'];
const ssrStore : Store = window['ssrStore'];

/**
 * View
 */
class SettingsAccountApp
{
    private static CLS_NAME = 'SettingsAccountApp';
    private store : Store;

    /**
     * @constructor
     */
    constructor()
    {
        this.store =
        {
            locale:   Utils.getLocale(),
            account:  ssrStore.account,
            message:  '',
            onNameChange:    this.onNameChange.   bind(this),
            onPhoneNoChange: this.onPhoneNoChange.bind(this),
            onChange:        this.onChange.       bind(this)
        };
    }

    /**
     * render
     */
    render() : void
    {
        ReactDOM.render(
            <SettingsAccountView store={this.store} />,
            document.getElementById('root'));
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

window.addEventListener('DOMContentLoaded', async () =>
{
    const app = new SettingsAccountApp();
    app.render();
});
