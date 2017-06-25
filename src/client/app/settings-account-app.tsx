/**
 * (C) 2016-2017 printf.jp
 */
import bind                from 'bind-decorator';
import * as React          from 'react';

import {Response}          from 'libs/response';
import SettingsApi         from '../api/settings-api';
import SettingsAccountView from '../components/views/settings-account-view';
import {Store}             from '../components/views/settings-account-view/store';
import Utils               from '../libs/utils';
import {App}               from './app';

const slog = window['slog'];
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
            locale:              Utils.getLocale(),
            account:             ssrStore.account,
            setAccountResponse:  ssrStore.setAccountResponse,
            message:             '',
            onNameChange:        this.onNameChange,
            onUserNameChange:    this.onUserNameChange,
            onPhoneNoChange:     this.onPhoneNoChange,
            onTwoFactorAuth:     this.onTwoFactorAuth,
            onCountryCodeChange: this.onCountryCodeChange,
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
        store.setAccountResponse = {status:Response.Status.OK, message:{}};
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

            if (res.status === Response.Status.OK) {
                store.account = res.account;
            }

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
        store.setAccountResponse.message.userName = res.message;
        this.render();
        this.checkUserNameTimerId = 0;
    }
}
