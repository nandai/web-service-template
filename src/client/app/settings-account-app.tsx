/**
 * (C) 2016-2017 printf.jp
 */
import bind                from 'bind-decorator';
import * as React          from 'react';

import SettingsApi         from 'client/api/settings-api';
import {App}               from 'client/app/app';
import SettingsAccountView from 'client/components/views/settings-account-view';
import {storeNS}           from 'client/components/views/settings-account-view/store';
import Utils               from 'client/libs/utils';
import {Response}          from 'libs/response';
import {slog}              from 'libs/slog';

const ssrStore = Utils.getSsrStore<storeNS.Store>();

/**
 * settings account app
 */
export default class SettingsAccountApp extends App
{
    private static CLS_NAME = 'SettingsAccountApp';
    private store : storeNS.Store;
    private checkUserNameTimerId = 0;

    /**
     * @constructor
     */
    constructor()
    {
        super();
        this.store = storeNS.init(ssrStore);
        this.store.onNameChange =        this.onNameChange;
        this.store.onUserNameChange =    this.onUserNameChange;
        this.store.onPhoneNoChange =     this.onPhoneNoChange;
        this.store.onTwoFactorAuth =     this.onTwoFactorAuth;
        this.store.onCountryCodeChange = this.onCountryCodeChange;
        this.store.onChange =            this.onChange;
        this.store.onBack =              this.onBack;
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
        return <SettingsAccountView store={this.store} />;
    }

    /**
     * onNameChange
     */
    @bind
    private onNameChange(value : string) : void
    {
        this.store.editAccount.name = value;
        this.render();
    }

    /**
     * onUserNameChange
     */
    @bind
    private onUserNameChange(value : string) : void
    {
        this.store.editAccount.userName = value;
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
        this.store.editAccount.phoneNo = value;
        this.render();
    }

    /**
     * onCountryCodeChange
     */
    @bind
    private onCountryCodeChange(value : string) : void
    {
        this.store.editAccount.countryCode = value;
        this.render();
    }

    /**
     * onTwoFactorAuth
     */
    @bind
    private onTwoFactorAuth(twoFactorAuth : string) : void
    {
        this.store.editAccount.twoFactorAuth = twoFactorAuth;
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
            const account = store.editAccount;
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
        const userName = store.editAccount.userName;
        const res : Response.CheckUserName = await SettingsApi.checkUserName({userName});
        store.checkUserNameResponse = res;
        this.render();
        this.checkUserNameTimerId = 0;
    }
}
