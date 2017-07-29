/**
 * (C) 2016-2017 printf.jp
 */
import bind                        from 'bind-decorator';
import * as React                  from 'react';

import SettingsApi                 from 'client/api/settings-api';
import {App}                       from 'client/app/app';
import SettingsAccountPasswordView from 'client/components/views/settings-account-password-view';
import {storeNS}                   from 'client/components/views/settings-account-password-view/store';
import Utils                       from 'client/libs/utils';
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
    constructor(ssrStore? : storeNS.Store)
    {
        super();

        if (! ssrStore) {
            ssrStore = Utils.getSsrStore<storeNS.Store>();
        }

        this.store = storeNS.init(ssrStore);
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
