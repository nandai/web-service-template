/**
 * (C) 2016-2017 printf.jp
 */
import * as React from 'react';

import {Request}  from 'libs/request';
import {Response} from 'libs/response';
import LoginApi   from '../api/login-api';
import LoginView  from '../components/views/login-view';
import {Store}    from '../components/views/login-view/store';
import History    from '../libs/history';
import Utils      from '../libs/utils';
import {App}      from './app';

const slog = window['slog'];
const ssrStore = Utils.getSsrStore<Store>();

/**
 * login app
 */
export default class LoginApp extends App
{
    private static CLS_NAME = 'LoginApp';
    private store : Store;

    /**
     * @constructor
     */
    constructor()
    {
        super();
        this.store =
        {
            locale:           Utils.getLocale(),
            name:             ssrStore.name,
            email:            '',
            password:         '',
            message:          ssrStore.message,
            onTwitter:        this.onTwitter.       bind(this),
            onFacebook:       this.onFacebook.      bind(this),
            onGoogle:         this.onGoogle.        bind(this),
            onGithub:         this.onGithub.        bind(this),
            onEmailChange:    this.onEmailChange.   bind(this),
            onPasswordChange: this.onPasswordChange.bind(this),
            onLogin:          this.onLogin.         bind(this),
            onSignup:         this.onSignup.        bind(this),
            onForget:         this.onForget.        bind(this),
            onUsers:          this.onUsers.         bind(this),
            onHome:           this.onHome.          bind(this),
            onAbout:          this.onAbout.         bind(this)
        };
    }

    /**
     * 初期化
     */
    init(params, message? : string)
    {
        document.cookie = 'command=; expires=Thu, 01 Jan 1970 00:00:00 GMT';

        const {store} = this;
        store.name = (location.pathname === '/' ? 'home' : 'about');
        store.message =  '';
        return super.init(params);
    }

    /**
     * view
     */
    view() : JSX.Element
    {
        return <LoginView store={this.store} />;
    }

    /**
     * onTwitter
     */
    private onTwitter() : void
    {
        const log = slog.stepIn(LoginApp.CLS_NAME, 'onTwitter');
        location.href = '/login/twitter';
        log.stepOut();
    }

    /**
     * onFacebook
     */
    private onFacebook() : void
    {
        const log = slog.stepIn(LoginApp.CLS_NAME, 'onFacebook');
        location.href = '/login/facebook';
        log.stepOut();
    }

    /**
     * onGoogle
     */
    private onGoogle() : void
    {
        const log = slog.stepIn(LoginApp.CLS_NAME, 'onGoogle');
        location.href = '/login/google';
        log.stepOut();
    }

    /**
     * onGithub
     */
    private onGithub() : void
    {
        const log = slog.stepIn(LoginApp.CLS_NAME, 'onGithub');
        location.href = '/login/github';
        log.stepOut();
    }

    /**
     * onEmailChange
     */
    private onEmailChange(e : React.ChangeEvent<HTMLInputElement>) : void
    {
        this.store.email = e.target.value;
        this.render();
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
     * onLogin
     */
    private async onLogin()
    {
        const log = slog.stepIn(LoginApp.CLS_NAME, 'onLogin');
        try
        {
            const {email, password} = this.store;
            await this.login({email, password});
            log.stepOut();
        }
        catch (err) {log.stepOut();}
    }

    /**
     * onSignup
     */
    private onSignup() : void
    {
        const log = slog.stepIn(LoginApp.CLS_NAME, 'onSignup');
        History.pushState('/signup');
        log.stepOut();
    }

    /**
     * onForget
     */
    private onForget() : void
    {
        const log = slog.stepIn(LoginApp.CLS_NAME, 'onForget');
        History.pushState('/forget');
        log.stepOut();
    }

    /**
     * onUsers
     */
    private onUsers() : void
    {
        const log = slog.stepIn(LoginApp.CLS_NAME, 'onUsers');
        History.pushState('/users');
        log.stepOut();
    }

    /**
     * onHome
     */
    private onHome() : void
    {
        const log = slog.stepIn(LoginApp.CLS_NAME, 'onHome');
        History.pushState('/');
        log.stepOut();
    }

    /**
     * onAbout
     */
    private onAbout() : void
    {
        const log = slog.stepIn(LoginApp.CLS_NAME, 'onAbout');
        History.pushState('/about');
        log.stepOut();
    }

    /**
     * login
     */
    private login(param : Request.LoginEmail)
    {
        return new Promise(async (resolve : () => void, reject) =>
        {
            const log = slog.stepIn(LoginApp.CLS_NAME, 'login');
            try
            {
                const res : Response.LoginEmail = await LoginApi.loginEmail(param);

                if (res.status !== Response.Status.OK)
                {
                    this.store.message = res.message;
                    this.render();
                }
                else
                {
                    if (res.smsId === undefined)
                    {
                        History.pushState('/', res.message);
                    }
                    else
                    {
                        History.pushState(`/?id=${res.smsId}`);
                    }
                }

                log.stepOut();
                resolve();
            }
            catch (err)
            {
                this.store.message = err.message;
                this.render();
                log.stepOut();
                reject();
            }
        });
    }
}
