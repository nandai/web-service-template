/**
 * (C) 2016-2017 printf.jp
 */
import bind                           from 'bind-decorator';
import * as React                     from 'react';

import SettingsApi                    from 'client/api/settings-api';
import {App}                          from 'client/app/app';
import SettingsAccountEmailChangeView from 'client/components/views/settings-account-email-change-view';
import {storeNS}                      from 'client/components/views/settings-account-email-change-view/store';
import R                              from 'client/libs/r';
import {Response}                     from 'libs/response';
import {slog}                         from 'libs/slog';
import CommonUtils                    from 'libs/utils';

/**
 * settings account email change app
 */
export default class SettingsAccountEmailChangeApp extends App
{
    private static CLS_NAME = 'SettingsAccountEmailChangeApp';
    store : storeNS.Store;

    /**
     * @constructor
     */
    constructor(ssrStore : storeNS.Store)
    {
        super();

        this.store = storeNS.init(ssrStore);
        this.url = '/settings/account/email/change';
        this.query = true;
        this.title = R.text(R.SETTINGS_ACCOUNT_EMAIL_CHANGE, this.store.locale);

        this.store.onPasswordChange = this.onPasswordChange;
        this.store.onChange =         this.onChange;
    }

    /**
     * toString
     */
    toString() : string
    {
        return 'SettingsAccountEmailChangeApp';
    }

    /**
     * factory
     */
    factory(store : storeNS.Store) : App
    {
        return new SettingsAccountEmailChangeApp(store);
    }

    /**
     * view
     */
    view(i : number) : JSX.Element
    {
        return <SettingsAccountEmailChangeView key={i} store={this.store} />;
    }

    /**
     * onPasswordChange
     */
    @bind
    private onPasswordChange(value : string) : void
    {
        this.store.password = value;
        App.render();
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
