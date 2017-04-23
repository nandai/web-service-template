/**
 * (C) 2016-2017 printf.jp
 */
import * as React               from 'react';
import * as ReactDOM            from 'react-dom';
import {App}                    from './app';
import SettingsApi              from '../api/settings-api';
import SettingsAccountEmailView from '../components/views/settings-account-email-view/settings-account-email-view';
import {Store}                  from '../components/views/settings-account-email-view/store';
import Utils                    from '../libs/utils';

const slog = window['slog'];
const ssrStore : Store = window['ssrStore'];

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
            locale:          Utils.getLocale(),
            account:         ssrStore.account,
            onEmailChange:   this.onEmailChange.bind(this),
            onChange:        this.onChange.     bind(this)
        };
    }

    /**
     * 初期化
     */
    init() : void
    {
        const {store} = this;
        store.message = '';
    }

    /**
     * render
     */
    render() : void
    {
        ReactDOM.render(
            <SettingsAccountEmailView store={this.store} />,
            document.getElementById('root'));
    }

    /**
     * onEmailChange
     */
    private onEmailChange(e : React.ChangeEvent<HTMLInputElement>) : void
    {
        this.store.account.email = e.target.value;
        this.render();
    }

    /**
     * onChange
     */
    private async onChange()
    {
        const log = slog.stepIn(SettingsAccountEmailApp.CLS_NAME, 'onChange');
        const {store} = this;

        try
        {
            const {account} = store;
            const {email} = account;

            const res = await SettingsApi.requestChangeEmail({email});
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
