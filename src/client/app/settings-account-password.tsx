/**
 * (C) 2016-2017 printf.jp
 */
import * as React                  from 'react';
import * as ReactDOM               from 'react-dom';
import {App}                       from './app';
import SettingsApi                 from '../api/settings-api';
import SettingsAccountPasswordView from '../components/views/settings-account-password-view/settings-account-password-view';
import {Store}                     from '../components/views/settings-account-password-view/store';
import Utils                       from '../libs/utils';

const slog = window['slog'];
const ssrStore : Store = window['ssrStore'];

/**
 * View
 */
export default class SettingsAccountPasswordApp extends App
{
    private static CLS_NAME = 'SettingsAccountPasswordApp';
    private store : Store;

    /**
     * @constructor
     */
    constructor()
    {
        super();
        this.store =
        {
            locale:      Utils.getLocale(),
            account:     ssrStore.account,
            oldPassword: '',
            newPassword: '',
            confirm:     '',
            message:     '',
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
        const {store} = this;

        try
        {
            const {oldPassword, newPassword, confirm} = store;

            const res = await SettingsApi.changePassword({oldPassword, newPassword, confirm});
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
