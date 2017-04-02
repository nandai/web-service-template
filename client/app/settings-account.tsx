/**
 * (C) 2016-2017 printf.jp
 */
import * as React          from 'react';
import * as ReactDOM       from 'react-dom';
import {Store}             from '../components/views/settings-account-view/store';
import SettingsAccountView from '../components/views/settings-account-view/settings-account-view';
import SettingsApi         from '../api/settings-api';

const slog = window['slog'];

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
        this.store = {
            account:  null,
            message:  '',
            onNameChange:    this.onNameChange.   bind(this),
            onPhoneNoChange: this.onPhoneNoChange.bind(this),
            onChange:        this.onChange.       bind(this)
        };
    }

    /**
     * 初期化
     */
    init()
    {
        return new Promise(async (resolve : () => void, reject) =>
        {
            const log = slog.stepIn(SettingsAccountApp.CLS_NAME, 'init');
            try
            {
                const {store} = this;
                store.account = await SettingsApi.getAccount();

                log.stepOut();
                resolve();
            }
            catch (err)
            {
                log.stepOut();
                reject();
            }
        });
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
        try
        {
            const {store} = this;
            const {account} = store;
            const {name, phoneNo} = account;

            store.message = await SettingsApi.setAccount({name, phoneNo});
            this.render();
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

window.addEventListener('DOMContentLoaded', async () =>
{
    const app = new SettingsAccountApp();
    await app.init();
    app.render();
});
