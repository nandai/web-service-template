/**
 * (C) 2016-2017 printf.jp
 */
import bind                           from 'bind-decorator';
import * as React                     from 'react';

import SettingsApi                    from 'client/api/settings-api';
import {App}                          from 'client/app/app';
import SettingsAccountEmailChangeView from 'client/components/views/settings-account-email-change-view';
import {Store}                        from 'client/components/views/settings-account-email-change-view/store';
import {slog}                         from 'client/libs/slog';
import Utils                          from 'client/libs/utils';
import {Response}                     from 'libs/response';
import CommonUtils                    from 'libs/utils';

const ssrStore = Utils.getSsrStore<Store>();

/**
 * settings account email change app
 */
export default class SettingsAccountEmailChangeApp extends App
{
    private static CLS_NAME = 'SettingsAccountEmailChangeApp';
    private store : Store;

    /**
     * @constructor
     */
    constructor()
    {
        super();
        this.store =
        {
            locale:   Utils.getLocale(),
            password: '',
            changeEmailResponse: ssrStore.changeEmailResponse,
            message:  '',
            onPasswordChange: this.onPasswordChange,
            onChange:         this.onChange,
        };
    }

    /**
     * view
     */
    view() : JSX.Element
    {
        return <SettingsAccountEmailChangeView store={this.store} />;
    }

    /**
     * onPasswordChange
     */
    @bind
    private onPasswordChange(value : string) : void
    {
        this.store.password = value;
        this.render();
    }

    /**
     * onChange
     */
    @bind
    private async onChange()
    {
        const log = slog.stepIn(SettingsAccountEmailChangeApp.CLS_NAME, 'onChange');
        const {store} = this;

        try
        {
            const params = CommonUtils.parseRawQueryString(location.search.substring(1));
            const changeId : string = params.id;
            const {password} = store;

            const res : Response.ChangeEmail = await SettingsApi.changeEmail({changeId, password});
            store.changeEmailResponse = res;
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
