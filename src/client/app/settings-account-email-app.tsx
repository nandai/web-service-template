/**
 * (C) 2016-2017 printf.jp
 */
import bind                     from 'bind-decorator';
import * as React               from 'react';

import SettingsApi              from 'client/api/settings-api';
import {App}                    from 'client/app/app';
import SettingsAccountEmailView from 'client/components/views/settings-account-email-view';
import {Store}                  from 'client/components/views/settings-account-email-view/store';
import Utils                    from 'client/libs/utils';
import {Response}               from 'libs/response';
import {slog}                   from 'libs/slog';

const ssrStore = Utils.getSsrStore<Store>();

/**
 * settings account email app
 */
export default class SettingsAccountEmailApp extends App
{
    private static CLS_NAME = 'SettingsAccountEmailApp';
    private store : Store;

    /**
     * @constructor
     */
    constructor()
    {
        super();
        this.store =
        {
            locale:                     Utils.getLocale(),
            account:                    ssrStore.account,
            requestChangeEmailResponse: ssrStore.requestChangeEmailResponse,
            loading:                    false,
            onEmailChange:              this.onEmailChange,
            onChange:                   this.onChange,
            onBack:                     this.onBack,
        };
    }

    /**
     * 初期化
     */
    init(params, _message? : string)
    {
        const {store} = this;
        store.requestChangeEmailResponse = {status:Response.Status.OK, message:{}};
        store.message = '';
        return super.init(params);
    }

    /**
     * view
     */
    view() : JSX.Element
    {
        return <SettingsAccountEmailView store={this.store} />;
    }

    /**
     * onEmailChange
     */
    @bind
    private onEmailChange(value : string) : void
    {
        this.store.account.email = value;
        this.render();
    }

    /**
     * onChange
     */
    @bind
    private async onChange()
    {
        const log = slog.stepIn(SettingsAccountEmailApp.CLS_NAME, 'onChange');
        const {store} = this;

        store.message = '';
        store.requestChangeEmailResponse.message = {};
        store.loading = true;
        this.render();

        try
        {
            const {account} = store;
            const {email} = account;

            const res : Response.RequestChangeEmail = await SettingsApi.requestChangeEmail({email});
            store.requestChangeEmailResponse = res;
            store.loading = false;
            this.render();
            log.stepOut();
        }
        catch (err)
        {
            store.message = err.message;
            store.loading = false;
            this.render();
            log.stepOut();
        }
    }
}
