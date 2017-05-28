/**
 * (C) 2016-2017 printf.jp
 */
import * as React                  from 'react';
import SettingsApi                 from '../api/settings-api';
import SettingsAccountPasswordView from '../components/views/settings-account-password-view';
import {Store}                     from '../components/views/settings-account-password-view/store';
import Utils                       from '../libs/utils';
import {App}                       from './app';

const slog = window['slog'];
const ssrStore = Utils.getSsrStore<Store>();

/**
 * settings account password app
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
            locale:              Utils.getLocale(),
            account:             ssrStore.account,
            onOldPasswordChange: this.onOldPasswordChange.bind(this),
            onNewPasswordChange: this.onNewPasswordChange.bind(this),
            onConfirmChange:     this.onConfirmChange.    bind(this),
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
        store.oldPassword = '',
        store.newPassword = '',
        store.confirm =     '',
        store.message =     '';
        return super.init(params);
    }

    /**
     * view
     */
    view() : JSX.Element
    {
        return <SettingsAccountPasswordView store={this.store} />;
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