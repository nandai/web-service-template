/**
 * (C) 2016-2017 printf.jp
 */
import * as React    from 'react';
import * as ReactDOM from 'react-dom';
import {App}         from './app';
import SettingsApi   from '../api/settings-api';
import SettingsView  from '../components/views/settings-view/settings-view';
import {Store}       from '../components/views/settings-view/store';
import History       from '../libs/history';
import Utils         from '../libs/utils';

const slog = window['slog'];
const ssrStore : Store = window['ssrStore'];

/**
 * settings app
 */
export default class SettingsApp extends App
{
    private static CLS_NAME = 'SettingsApp';
    private store : Store;

    /**
     * @constructor
     */
    constructor()
    {
        super();
        this.store =
        {
            locale:     Utils.getLocale(),
            account:    ssrStore.account,
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
    init() : void
    {
        const {store} = this;
        store.message = ssrStore.message;

        ssrStore.message = '';
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
        History.pushState('/settings/account/email');
        log.stepOut();
    }

    /**
     * onPassword
     */
    private onPassword() : void
    {
        const log = slog.stepIn(SettingsApp.CLS_NAME, 'onPassword');
        History.pushState('/settings/account/password');
        log.stepOut();
    }

    /**
     * onAccount
     */
    private onAccount() : void
    {
        const log = slog.stepIn(SettingsApp.CLS_NAME, 'onAccount');
        History.pushState('/settings/account');
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
                History.pushState('/');
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
        History.pushState('/');
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
