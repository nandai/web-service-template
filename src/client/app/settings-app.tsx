/**
 * (C) 2016-2017 printf.jp
 */
import bind         from 'bind-decorator';
import * as React   from 'react';

import SettingsApi  from 'client/api/settings-api';
import {App}        from 'client/app/app';
import SettingsView from 'client/components/views/settings-view';
import {storeNS}    from 'client/components/views/settings-view/store';
import History      from 'client/libs/history';
import {pageNS}     from 'client/libs/page';
import R            from 'client/libs/r';
import Utils        from 'client/libs/utils';
import {Response}   from 'libs/response';
import {slog}       from 'libs/slog';

/**
 * settings app
 */
export default class SettingsApp extends App
{
    private static CLS_NAME = 'SettingsApp';
    store : storeNS.Store;

    /**
     * @constructor
     */
    constructor(ssrStore? : storeNS.Store)
    {
        super();

        if (! ssrStore) {
            ssrStore = Utils.getSsrStore<storeNS.Store>();
        }

        this.store = storeNS.init(ssrStore);
        this.url = '/settings';
        this.auth = true;
        this.title = R.text(R.SETTINGS, this.store.locale);

        this.store.onTwitter =    this.onTwitter;
        this.store.onFacebook =   this.onFacebook;
        this.store.onGoogle =     this.onGoogle;
        this.store.onGithub =     this.onGithub;
        this.store.onEmail =      this.onEmail;
        this.store.onPassword =   this.onPassword;
        this.store.onAccount =    this.onAccount;
        this.store.onLeave =      this.onLeave;
        this.store.onBack =       this.onBack;
        this.store.onLeaveOK =    this.onLeaveOK;
        this.store.onCloseModal = this.onCloseModal;
        this.store.modalPage.onPageTransitionEnd = this.onPageTransitionEnd;
    }

    /**
     * toString
     */
    toString() : string
    {
        return 'SettingsApp';
    }

    /**
     * 初期化
     */
    init(params, _message? : string)
    {
        this.store = storeNS.init(this.store);
        this.store.message = '';
        return super.init(params);
    }

    /**
     * view
     */
    view(i : number) : JSX.Element
    {
        return <SettingsView key={i} store={this.store} />;
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
    private onLeave()
    {
        pageNS.next(this.store.modalPage, App.render);
    }

    @bind
    private onPageTransitionEnd(_page : pageNS.Page)
    {
        pageNS.next(this.store.modalPage, App.render);
    }

    @bind
    private onCloseModal()
    {
        pageNS.next(this.store.modalPage, App.render);
    }

    @bind
    private async onLeaveOK()
    {
        const log = slog.stepIn(SettingsApp.CLS_NAME, 'onLeaveOK');
        const {store} = this;

        try
        {
            /*const res : Response.DeleteAccount = */await SettingsApi.deleteAccount();
            log.stepOut();
        }
        catch (err)
        {
            store.message = err.message;
            App.render();
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
                    store.unlinkProviderResponse = res;
                }

                App.render();
                log.stepOut();
                resolve();
            }
            catch (err)
            {
                store.message = err.message;
                App.render();
                log.stepOut();
                reject();
            }
        });
    }
}
