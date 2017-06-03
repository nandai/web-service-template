/**
 * (C) 2016-2017 printf.jp
 */
import bind                        from 'bind-decorator';
import * as React                  from 'react';

import {Response}                  from 'libs/response';
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
            onOldPasswordChange: this.onOldPasswordChange,
            onNewPasswordChange: this.onNewPasswordChange,
            onConfirmChange:     this.onConfirmChange,
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
    @bind
    private onOldPasswordChange(value : string) : void
    {
        this.store.oldPassword = value;
        this.render();
    }

    /**
     * onNewPasswordChange
     */
    @bind
    private onNewPasswordChange(value : string) : void
    {
        this.store.newPassword = value;
        this.render();
    }

    /**
     * onConfirmChange
     */
    @bind
    private onConfirmChange(value : string) : void
    {
        this.store.confirm = value;
        this.render();
    }

    /**
     * onChange
     */
    @bind
    private async onChange()
    {
        const log = slog.stepIn(SettingsAccountPasswordApp.CLS_NAME, 'onChange');
        const {store} = this;

        try
        {
            const {oldPassword, newPassword, confirm} = store;

            const res : Response.ChangePassword = await SettingsApi.changePassword({oldPassword, newPassword, confirm});
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
