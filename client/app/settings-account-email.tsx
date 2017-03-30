/**
 * (C) 2016-2017 printf.jp
 */
import * as React               from 'react';
import * as ReactDOM            from 'react-dom';
import {Store}                  from '../components/views/settings-account-email-view/store';
import SettingsAccountEmailView from '../components/views/settings-account-email-view/settings-account-email-view';
import Api                      from '../utils/api';

const slog =  window['slog'];

/**
 * View
 */
class SettingsAccountEmailApp
{
    private static CLS_NAME = 'SettingsAccountEmailApp';
    private store : Store;

    /**
     * @constructor
     */
    constructor()
    {
        this.store = {
            account:  null,
            message:  '',
            onEmailChange:   this.onEmailChange.bind(this),
            onChange:        this.onChange.     bind(this)
        };
    }

    /**
     * 初期化
     */
    init()
    {
        return new Promise(async (resolve : () => void, reject) =>
        {
            const log = slog.stepIn(SettingsAccountEmailApp.CLS_NAME, 'init');
            try
            {
                const {store} = this;
                store.account = await Api.getAccount();

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
            <SettingsAccountEmailView store={this.store} />,
            document.getElementById('root'));
    }

    /**
     * onEmailChange
     */
    private onEmailChange(e : React.ChangeEvent<HTMLInputElement>) : void
    {
        this.store.account.email = e.target.value;
        this.render();
    }

    /**
     * onChange
     */
    private async onChange()
    {
        const log = slog.stepIn(SettingsAccountEmailApp.CLS_NAME, 'onChange');
        try
        {
            const {store} = this;
            const {account} = store;
            const {email} = account;

            store.message = await Api.changeEmail(email);
            this.render();
            log.stepOut();
        }
        catch (err) {log.stepOut()}
    }
}

window.addEventListener('DOMContentLoaded', async () =>
{
    const app = new SettingsAccountEmailApp();
    await app.init();
    app.render();
});
