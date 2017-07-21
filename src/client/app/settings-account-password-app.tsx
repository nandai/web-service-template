/**
 * (C) 2016-2017 printf.jp
 */
import bind                        from 'bind-decorator';
import * as React                  from 'react';

import SettingsApi                 from 'client/api/settings-api';
import {App}                       from 'client/app/app';
import SettingsAccountPasswordView from 'client/components/views/settings-account-password-view';
import {Store}                     from 'client/components/views/settings-account-password-view/store';
import {slog}                      from 'client/libs/slog';
import Utils                       from 'client/libs/utils';
import {Response}                  from 'libs/response';

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
            locale:                 Utils.getLocale(),
            account:                ssrStore.account,
            oldPassword:            '',
            newPassword:            '',
            confirm:                '',
            changePasswordResponse: ssrStore.changePasswordResponse,
            onOldPasswordChange:    this.onOldPasswordChange,
            onNewPasswordChange:    this.onNewPasswordChange,
            onConfirmChange:        this.onConfirmChange,
            onChange:               this.onChange,
            onBack:                 this.onBack,
        };
    }

    /**
     * 初期化
     */
    init(params, _message? : string)
    {
        const {store} = this;
        store.oldPassword = '',
        store.newPassword = '',
        store.confirm =     '',
        store.changePasswordResponse = {status:Response.Status.OK, message:{}};
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
            store.changePasswordResponse = res;
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
