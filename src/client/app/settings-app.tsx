/**
 * (C) 2016-2017 printf.jp
 */
import bind         from 'bind-decorator';
import * as React   from 'react';

import {Response}   from 'libs/response';
import SettingsApi  from '../api/settings-api';
import SettingsView from '../components/views/settings-view';
import {Store}      from '../components/views/settings-view/store';
import History      from '../libs/history';
import Utils        from '../libs/utils';
import {App}        from './app';

const slog = window['slog'];
const ssrStore = Utils.getSsrStore<Store>();

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
            message:    ssrStore.message,
            onTwitter:  this.onTwitter,
            onFacebook: this.onFacebook,
            onGoogle:   this.onGoogle,
            onGithub:   this.onGithub,
            onEmail:    this.onEmail,
            onPassword: this.onPassword,
            onAccount:  this.onAccount,
            onLeave:    this.onLeave,
            onBack:     this.onBack,
        };
    }

    /**
     * 初期化
     */
    init(params, message? : string)
    {
        const {store} = this;
        store.message = '';
        return super.init(params);
    }

    /**
     * view
     */
    view() : JSX.Element
    {
        return <SettingsView store={this.store} />;
    }

    /**
     * onTwitter
     */
    @bind
    private async onTwitter()
    {
        const log = slog.stepIn(SettingsApp.CLS_NAME, 'onTwitter');

        if (this.store.account.twitter === false)
        {
            location.href = '/settings/account/link/twitter';
        }
        else
        {
            await this.unlink('twitter');
        }

        log.stepOut();
    }

    /**
     * onFacebook
     */
    @bind
    private async onFacebook()
    {
        const log = slog.stepIn(SettingsApp.CLS_NAME, 'onFacebook');

        if (this.store.account.facebook === false)
        {
            location.href = '/settings/account/link/facebook';
        }
        else
        {
            await this.unlink('facebook');
        }

        log.stepOut();
    }

    /**
     * onGoogle
     */
    @bind
    private async onGoogle()
    {
        const log = slog.stepIn(SettingsApp.CLS_NAME, 'onGoogle');

        if (this.store.account.google === false)
        {
            location.href = '/settings/account/link/google';
        }
        else
        {
            await this.unlink('google');
        }

        log.stepOut();
    }

    /**
     * onGithub
     */
    @bind
    private async onGithub()
    {
        const log = slog.stepIn(SettingsApp.CLS_NAME, 'onGithub');

        if (this.store.account.github === false)
        {
            location.href = '/settings/account/link/github';
        }
        else
        {
            await this.unlink('github');
        }

        log.stepOut();
    }

    /**
     * onEmail
     */
    @bind
    private onEmail() : void
    {
        const log = slog.stepIn(SettingsApp.CLS_NAME, 'onEmail');
        History.pushState('/settings/account/email');
        log.stepOut();
    }

    /**
     * onPassword
     */
    @bind
    private onPassword() : void
    {
        const log = slog.stepIn(SettingsApp.CLS_NAME, 'onPassword');
        History.pushState('/settings/account/password');
        log.stepOut();
    }

    /**
     * onAccount
     */
    @bind
    private onAccount() : void
    {
        const log = slog.stepIn(SettingsApp.CLS_NAME, 'onAccount');
        History.pushState('/settings/account');
        log.stepOut();
    }

    /**
     * onLeave
     */
    @bind
    private async onLeave()
    {
        const log = slog.stepIn(SettingsApp.CLS_NAME, 'onLeave');
        const {store} = this;

        try
        {
            const res : Response.DeleteAccount = await SettingsApi.deleteAccount();

            if (res.status === Response.Status.OK) {
                History.back();
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
     * unlink
     */
    private unlink(provider : 'twitter' | 'facebook' | 'google' | 'github')
    {
        return new Promise(async (resolve : () => void, reject) =>
        {
            const log = slog.stepIn(SettingsApp.CLS_NAME, 'unlink');
            const {store} = this;

            try
            {
                const res : Response.UnlinkProvider = await SettingsApi.unlinkProvider({provider});

                if (res.status === Response.Status.OK)
                {
                    store.account[provider] = false;
                }
                else
                {
                    store.message = res.message;
                }

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
