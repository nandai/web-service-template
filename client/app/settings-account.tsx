/**
 * (C) 2016-2017 printf.jp
 */
 import * as React          from 'react';
 import * as ReactDOM       from 'react-dom';
 import {Store}             from '../components/views/settings-account-view/store';
 import SettingsAccountView from '../components/views/settings-account-view/settings-account-view';
 import Api                 from '../utils/api';

const slog = window['slog'];

/**
 * View
 */
class SettingsAccountApp
{
    private static CLS_NAME = 'SettingsAccountView';
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
     * 初期化
     */
    init()
    {
        return new Promise(async (resolve : () => void, reject) =>
        {
            const log = slog.stepIn(SettingsAccountApp.CLS_NAME, 'init');
            try
            {
                const account = await Api.getAccount();

                const {store} = this;
                store.account = account;

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
     * onChange
     */
    private async onChange()
    {
        const log = slog.stepIn(SettingsAccountApp.CLS_NAME, 'onChange');
        try
        {
            const {store} = this;
            const {account} = store;
            const name =    account.name;
            const phoneNo = account.phoneNo;

            store.message = await Api.setAccount(name, phoneNo);
            this.render();
            log.stepOut();
        }
        catch (err) {log.stepOut()}
    }
}

window.addEventListener('DOMContentLoaded', async () =>
{
    const app = new SettingsAccountApp();
    await app.init();
    app.render();
});
