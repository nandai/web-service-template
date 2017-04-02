/**
 * (C) 2016-2017 printf.jp
 */
import * as React                     from 'react';
import * as ReactDOM                  from 'react-dom';
import {Store}                        from '../components/views/settings-account-email-change-view/store';
import SettingsAccountEmailChangeView from '../components/views/settings-account-email-change-view/settings-account-email-change-view';
import SettingsApi                    from '../api/settings-api';

const slog =     window['slog'];
const changeId = window['message'];

/**
 * View
 */
class SettingsAccountEmailChangeApp
{
    private static CLS_NAME = 'SettingsAccountEmailChangeApp';
    private store : Store;

    /**
     * @constructor
     */
    constructor()
    {
        this.store = {
            password: '',
            message:  '',
            onPasswordChange: this.onPasswordChange.bind(this),
            onChange:         this.onChange.        bind(this)
        };
    }

    /**
     * render
     */
    render() : void
    {
        ReactDOM.render(
            <SettingsAccountEmailChangeView store={this.store} />,
            document.getElementById('root'));
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
        try
        {
            const {store} = this;
            const {password} = store;

            store.message = await SettingsApi.changeEmail({changeId, password});
            this.render();
            log.stepOut();
        }
        catch (err)
        {
            this.store.message = err.message;
            this.render();
            log.stepOut();
        }
    }
}

window.addEventListener('load', () => new SettingsAccountEmailChangeView(), false);
window.addEventListener('DOMContentLoaded', async () =>
{
    const app = new SettingsAccountEmailChangeApp();
    app.render();
});
