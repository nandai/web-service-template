/**
 * (C) 2016-2017 printf.jp
 */
import * as React    from 'react';
import * as ReactDOM from 'react-dom';
import {Store}       from '../components/views/settings-view/store';
import SettingsView  from '../components/views/settings-view/settings-view';
import SettingsApi   from '../api/settings-api';

const slog =         window['slog'];
const errorMessage = window['message'];

/**
 * View
 */
class SettingsApp
{
    private static CLS_NAME = 'SettingsApp';
    private store : Store;

    /**
     * @constructor
     */
    constructor()
    {
        this.store = {
            account:    null,
            message:    errorMessage,
            onTwitter:  this.onTwitter. bind(this),
            onFacebook: this.onFacebook.bind(this),
            onGoogle:   this.onGoogle.  bind(this),
            onEmail:    this.onEmail.   bind(this),
            onPassword: this.onPassword.bind(this),
            onAccount:  this.onAccount. bind(this),
            onLeave:    this.onLeave.   bind(this),
            onBack:     this.onBack.    bind(this)
        };
    }

    /**
     * 初期化
     */
    init()
    {
        return new Promise(async (resolve : () => void, reject) =>
        {
            const log = slog.stepIn(SettingsApp.CLS_NAME, 'init');
            try
            {
                const {store} = this;
                const res = await SettingsApi.getAccount();
                store.account = res.account;

                log.stepOut();
                resolve();
            }
            catch (err)
            {
                log.stepOut();
                reject();
            }
        });
    }

    /**
     * render
     */
    render() : void
    {
        ReactDOM.render(
            <SettingsView store={this.store} />,
            document.getElementById('root'));
    }

    /**
     * onTwitter
     */
    private async onTwitter()
    {
        const log = slog.stepIn(SettingsApp.CLS_NAME, 'onTwitter');

        if (this.store.account.twitter === false)
            location.href = '/settings/account/link/twitter';
        else
            await this.unlink('twitter');

        log.stepOut();
    }

    /**
     * onFacebook
     */
    private async onFacebook()
    {
        const log = slog.stepIn(SettingsApp.CLS_NAME, 'onFacebook');

        if (this.store.account.facebook === false)
            location.href = '/settings/account/link/facebook';
        else
            await this.unlink('facebook');

        log.stepOut();
    }

    /**
     * onGoogle
     */
    private async onGoogle()
    {
        const log = slog.stepIn(SettingsApp.CLS_NAME, 'onGoogle');

        if (this.store.account.google === false)
            location.href = '/settings/account/link/google';
        else
            await this.unlink('google');

        log.stepOut();
    }

    /**
     * onEmail
     */
    private onEmail() : void
    {
        const log = slog.stepIn(SettingsApp.CLS_NAME, 'onEmail');
        window.location.href = '/settings/account/email';
        log.stepOut();
    }

    /**
     * onPassword
     */
    private onPassword() : void
    {
        const log = slog.stepIn(SettingsApp.CLS_NAME, 'onPassword');
        window.location.href = '/settings/account/password';
        log.stepOut();
    }

    /**
     * onAccount
     */
    private onAccount() : void
    {
        const log = slog.stepIn(SettingsApp.CLS_NAME, 'onAccount');
        window.location.href = '/settings/account';
        log.stepOut();
    }

    /**
     * onLeave
     */
    private async onLeave()
    {
        const log = slog.stepIn(SettingsApp.CLS_NAME, 'onLeave');
        const {store} = this;

        try
        {
            const res = await SettingsApi.deleteAccount();

            if (res.status === 0)
            {
                location.href = '/';
            }
            else
            {
                store.message = res.message;
                this.render();
            }

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
     * onBack
     */
    private onBack() : void
    {
        const log = slog.stepIn(SettingsApp.CLS_NAME, 'onBack');
        window.location.href = '/';
        log.stepOut();
    }

    /**
     * unlink
     */
    private unlink(provider : 'twitter' | 'facebook' | 'google')
    {
        return new Promise(async (resolve : () => void, reject) =>
        {
            const log = slog.stepIn(SettingsApp.CLS_NAME, 'unlink');
            const {store} = this;

            try
            {
                const res = await SettingsApi.unlinkProvider({provider});

                if (res.status === 0) store.account[provider] = false;
                else                  store.message = res.message;

                this.render();
                log.stepOut();
                resolve();
            }
            catch (err)
            {
                store.message = err.message;
                this.render();
                log.stepOut();
                reject();
            }
        });
    }
}

window.addEventListener('DOMContentLoaded', async () =>
{
    const app = new SettingsApp();
    await app.init();
    app.render();
});

if (window.location.hash === '#_=_')
    window.history.pushState('', document.title, window.location.pathname);
