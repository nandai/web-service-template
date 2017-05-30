/**
 * (C) 2016-2017 printf.jp
 */
import * as React                     from 'react';

import {Response}                     from 'libs/response';
import CommonUtils                    from 'libs/utils';
import SettingsApi                    from '../api/settings-api';
import SettingsAccountEmailChangeView from '../components/views/settings-account-email-change-view';
import {Store}                        from '../components/views/settings-account-email-change-view/store';
import Utils                          from '../libs/utils';
import {App}                          from './app';

const slog = window['slog'];

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
            message:  '',
            onPasswordChange: this.onPasswordChange.bind(this),
            onChange:         this.onChange.        bind(this)
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
    private onPasswordChange(e : React.ChangeEvent<HTMLInputElement>) : void
    {
        this.store.password = e.target.value;
        this.render();
    }

    /**
     * onChange
     */
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
