/**
 * (C) 2016-2017 printf.jp
 */
import bind                from 'bind-decorator';
import * as React          from 'react';

import SettingsApi         from 'client/api/settings-api';
import {App}               from 'client/app/app';
import SettingsAccountView from 'client/components/views/settings-account-view';
import {Store}             from 'client/components/views/settings-account-view/store';
import {slog}              from 'client/libs/slog';
import Utils               from 'client/libs/utils';
import {Response}          from 'libs/response';

const ssrStore = Utils.getSsrStore<Store>();

/**
 * settings account app
 */
export default class SettingsAccountApp extends App
{
    private static CLS_NAME = 'SettingsAccountApp';
    private store : Store;
    private checkUserNameTimerId = 0;

    /**
     * @constructor
     */
    constructor()
    {
        super();
        this.store =
        {
            locale:                Utils.getLocale(),
            account:               ssrStore.account,
            setAccountResponse:    ssrStore.setAccountResponse,
            checkUserNameResponse: ssrStore.checkUserNameResponse,
            message:               '',
            onNameChange:          this.onNameChange,
            onUserNameChange:      this.onUserNameChange,
            onPhoneNoChange:       this.onPhoneNoChange,
            onTwoFactorAuth:       this.onTwoFactorAuth,
            onCountryCodeChange:   this.onCountryCodeChange,
            onChange:              this.onChange,
            onBack:                this.onBack,
        };
    }

    /**
     * 初期化
     */
    init(params, message? : string)
    {
        const {store} = this;
        store.setAccountResponse =    {status:Response.Status.OK, message:{}};
        store.checkUserNameResponse = {status:Response.Status.OK, message:{}};
        store.message = '';
        return super.init(params);
    }

    /**
     * view
     */
    view() : JSX.Element
    {
        return <SettingsAccountView store={this.store} />;
    }

    /**
     * onNameChange
     */
    @bind
    private onNameChange(value : string) : void
    {
        this.store.account.name = value;
        this.render();
    }

    /**
     * onUserNameChange
     */
    @bind
    private onUserNameChange(value : string) : void
    {
        this.store.account.userName = value;
        this.render();

        if (this.checkUserNameTimerId) {
            clearTimeout(this.checkUserNameTimerId);
        }

        this.checkUserNameTimerId = setTimeout(this.checkUserName, 500) as any;
    }

    /**
     * onPhoneNoChange
     */
    @bind
    private onPhoneNoChange(value : string) : void
    {
        this.store.account.phoneNo = value;
        this.render();
    }

    /**
     * onCountryCodeChange
     */
    @bind
    private onCountryCodeChange(value : string) : void
    {
        this.store.account.countryCode = value;
        this.render();
    }

    /**
     * onTwoFactorAuth
     */
    @bind
    private onTwoFactorAuth(twoFactorAuth : string) : void
    {
        this.store.account.twoFactorAuth = twoFactorAuth;
        this.render();
    }

    /**
     * onChange
     */
    @bind
    private async onChange()
    {
        const log = slog.stepIn(SettingsAccountApp.CLS_NAME, 'onChange');
        const {store} = this;

        try
        {
            const {account} = store;
            const {name, userName, countryCode, phoneNo, twoFactorAuth} = account;

            const res : Response.SetAccount = await SettingsApi.setAccount({name, userName, countryCode, phoneNo, twoFactorAuth});
            store.setAccountResponse = res;

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

    /**
     * ユーザー名チェック
     */
    @bind
    private async checkUserName()
    {
        const {store} = this;
        const userName = store.account.userName;
        const res : Response.CheckUserName = await SettingsApi.checkUserName({userName});
        store.checkUserNameResponse = res;
        this.render();
        this.checkUserNameTimerId = 0;
    }
}
