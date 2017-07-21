/**
 * (C) 2016-2017 printf.jp
 */
import bind       from 'bind-decorator';
import * as React from 'react';

import LoginApi   from 'client/api/login-api';
import {App}      from 'client/app/app';
import LoginView  from 'client/components/views/login-view';
import {Store}    from 'client/components/views/login-view/store';
import History    from 'client/libs/history';
import {slog}     from 'client/libs/slog';
import Utils      from 'client/libs/utils';
import {Request}  from 'libs/request';
import {Response} from 'libs/response';

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
            locale:             Utils.getLocale(),
            name:               ssrStore.name,
            email:              '',
            password:           '',
            loginEmailResponse: ssrStore.loginEmailResponse,
            message:            ssrStore.message,
            onTwitter:          this.onTwitter,
            onFacebook:         this.onFacebook,
            onGoogle:           this.onGoogle,
            onGithub:           this.onGithub,
            onEmailChange:      this.onEmailChange,
            onPasswordChange:   this.onPasswordChange,
            onLogin:            this.onLogin,
            onSignup:           this.onSignup,
            onForget:           this.onForget,
            onUsers:            this.onUsers,
            onHome:             this.onHome,
            onAbout:            this.onAbout,
        };
    }

    /**
     * 初期化
     */
    init(params, _message? : string)
    {
        document.cookie = 'command=; expires=Thu, 01 Jan 1970 00:00:00 GMT';

        const {store} = this;
        store.name = (location.pathname === '/' ? 'home' : 'about');
        store.loginEmailResponse = {status:Response.Status.OK, message:{}};
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
    @bind
    private onTwitter() : void
    {
        const log = slog.stepIn(LoginApp.CLS_NAME, 'onTwitter');
        location.href = '/login/twitter';
        log.stepOut();
    }

    /**
     * onFacebook
     */
    @bind
    private onFacebook() : void
    {
        const log = slog.stepIn(LoginApp.CLS_NAME, 'onFacebook');
        location.href = '/login/facebook';
        log.stepOut();
    }

    /**
     * onGoogle
     */
    @bind
    private onGoogle() : void
    {
        const log = slog.stepIn(LoginApp.CLS_NAME, 'onGoogle');
        location.href = '/login/google';
        log.stepOut();
    }

    /**
     * onGithub
     */
    @bind
    private onGithub() : void
    {
        const log = slog.stepIn(LoginApp.CLS_NAME, 'onGithub');
        location.href = '/login/github';
        log.stepOut();
    }

    /**
     * onEmailChange
     */
    @bind
    private onEmailChange(value : string) : void
    {
        this.store.email = value;
        this.render();
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
     * onLogin
     */
    @bind
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
    @bind
    private onSignup() : void
    {
        const log = slog.stepIn(LoginApp.CLS_NAME, 'onSignup');
        History.pushState('/signup');
        log.stepOut();
    }

    /**
     * onForget
     */
    @bind
    private onForget() : void
    {
        const log = slog.stepIn(LoginApp.CLS_NAME, 'onForget');
        History.pushState('/forget');
        log.stepOut();
    }

    /**
     * onUsers
     */
    @bind
    private onUsers() : void
    {
        const log = slog.stepIn(LoginApp.CLS_NAME, 'onUsers');
        History.pushState('/users');
        log.stepOut();
    }

    /**
     * onHome
     */
    @bind
    private onHome() : void
    {
        const log = slog.stepIn(LoginApp.CLS_NAME, 'onHome');
        History.pushState('/');
        log.stepOut();
    }

    /**
     * onAbout
     */
    @bind
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
                this.store.loginEmailResponse = res;

                if (res.status !== Response.Status.OK)
                {
                    this.render();
                }
                else
                {
                    if (res.smsId === undefined)
                    {
                        History.pushState('/', res.message.general);
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
