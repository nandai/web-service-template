/**
 * (C) 2016-2017 printf.jp
 */
import * as React                  from 'react';
import * as ReactDOM               from 'react-dom';
import {Store}                     from '../components/views/settings-account-password-view/store';
import SettingsAccountPasswordView from '../components/views/settings-account-password-view/settings-account-password-view';
import Api                         from '../api/api';

const slog =  window['slog'];

/**
 * View
 */
class SettingsAccountPasswordApp
{
    private static CLS_NAME = 'SettingsAccountPasswordApp';
    private store : Store;

    /**
     * @constructor
     */
    constructor()
    {
        this.store = {
            oldPassword:  '',
            newPassword:  '',
            confirm:      '',
            message:      '',
            onOldPasswordChange: this.onOldPasswordChange.bind(this),
            onNewPasswordChange: this.onNewPasswordChange.bind(this),
            onConfirmChange:     this.onConfirmChange.    bind(this),
            onChange:            this.onChange.           bind(this)
        };
    }

    /**
     * render
     */
    render() : void
    {
        ReactDOM.render(
            <SettingsAccountPasswordView store={this.store} />,
            document.getElementById('root'));
    }

    /**
     * onOldPasswordChange
     */
    private onOldPasswordChange(e : React.ChangeEvent<HTMLInputElement>) : void
    {
        this.store.oldPassword = e.target.value;
        this.render();
    }

    /**
     * onNewPasswordChange
     */
    private onNewPasswordChange(e : React.ChangeEvent<HTMLInputElement>) : void
    {
        this.store.newPassword = e.target.value;
        this.render();
    }

    /**
     * onConfirmChange
     */
    private onConfirmChange(e : React.ChangeEvent<HTMLInputElement>) : void
    {
        this.store.confirm = e.target.value;
        this.render();
    }

    /**
     * onChange
     */
    private async onChange()
    {
        const log = slog.stepIn(SettingsAccountPasswordApp.CLS_NAME, 'onChange');
        try
        {
            const {store} = this;
            const {oldPassword, newPassword, confirm} = store;

            store.message = await Api.changePassword({oldPassword, newPassword, confirm});
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
    const app = new SettingsAccountPasswordApp();
    app.render();
});
