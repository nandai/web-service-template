/**
 * (C) 2016-2017 printf.jp
 */
import bind                        from 'bind-decorator';
import * as React                  from 'react';

import SettingsApi                 from 'client/api/settings-api';
import {App}                       from 'client/app/app';
import SettingsAccountPasswordView from 'client/components/views/settings-account-password-view';
import {storeNS}                   from 'client/components/views/settings-account-password-view/store';
import R                           from 'client/libs/r';
import {Response}                  from 'libs/response';
import {slog}                      from 'libs/slog';

/**
 * settings account password app
 */
export default class SettingsAccountPasswordApp extends App
{
    private static CLS_NAME = 'SettingsAccountPasswordApp';
    store : storeNS.Store;

    /**
     * @constructor
     */
    constructor(ssrStore : storeNS.Store)
    {
        super();

        this.store = storeNS.init(ssrStore);
        this.url = '/settings/account/password';
        this.auth = true;
        this.title = R.text(R.SETTINGS_ACCOUNT_PASSWORD, this.store.locale);

        this.store.onOldPasswordChange = this.onOldPasswordChange;
        this.store.onNewPasswordChange = this.onNewPasswordChange;
        this.store.onConfirmChange =     this.onConfirmChange;
        this.store.onChange =            this.onChange;
        this.store.onBack =              this.onBack;
    }

    /**
     * toString
     */
    toString() : string
    {
        return 'SettingsAccountPasswordApp';
    }

    /**
     * 初期化
     */
    init(params, _message? : string)
    {
        this.store = storeNS.init(this.store);
        return super.init(params);
    }

    /**
     * view
     */
    view(i : number) : JSX.Element
    {
        return <SettingsAccountPasswordView key={i} store={this.store} />;
    }

    /**
     * onOldPasswordChange
     */
    @bind
    private onOldPasswordChange(value : string) : void
    {
        this.store.oldPassword = value;
        App.render();
    }

    /**
     * onNewPasswordChange
     */
    @bind
    private onNewPasswordChange(value : string) : void
    {
        this.store.newPassword = value;
        App.render();
    }

    /**
     * onConfirmChange
     */
    @bind
    private onConfirmChange(value : string) : void
    {
        this.store.confirm = value;
        App.render();
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
            App.render();
            log.stepOut();
        }
        catch (err)
        {
            store.message = err.message;
            App.render();
            log.stepOut();
        }
    }
}
