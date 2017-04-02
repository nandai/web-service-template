/**
 * (C) 2016-2017 printf.jp
 */
import * as React    from 'react';
import * as ReactDOM from 'react-dom';
import {Request}     from 'libs/request';
import {Store}       from '../components/views/login-view/store';
import LoginView     from '../components/views/login-view/login-view';
import Api           from '../api/api';

const slog =    window['slog'];
const message = window['message'];

/**
 * View
 */
class LoginApp
{
    private static CLS_NAME = 'LoginApp';
    private store : Store;

    /**
     * @constructor
     */
    constructor()
    {
        this.store = {
            email:    '',
            password: '',
            message:  message,
            onTwitter:        this.onTwitter.       bind(this),
            onFacebook:       this.onFacebook.      bind(this),
            onGoogle:         this.onGoogle.        bind(this),
            onEmailChange:    this.onEmailChange.   bind(this),
            onPasswordChange: this.onPasswordChange.bind(this),
            onLogin:          this.onLogin.         bind(this),
            onSignup:         this.onSignup.        bind(this),
            onForget:         this.onForget.        bind(this)
        };
    }

    /**
     * render
     */
    render() : void
    {
        ReactDOM.render(
            <LoginView store={this.store} />,
            document.getElementById('root'));
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
            await this.login('email',
            {
                email:    this.store.email,
                password: this.store.password
            });
            log.stepOut();
        }
        catch (err) {log.stepOut()}
    }

    /**
     * onSignup
     */
    private onSignup() : void
    {
        const log = slog.stepIn(LoginApp.CLS_NAME, 'onSignup');
        location.href = '/signup';
        log.stepOut();
    }

    /**
     * onForget
     */
    private onForget() : void
    {
        const log = slog.stepIn(LoginApp.CLS_NAME, 'onForget');
        location.href = '/forget';
        log.stepOut();
    }

    /**
     * login
     */
    private login(sns : string, param : Request.LoginEmail)
    {
        return new Promise(async (resolve : () => void, reject) =>
        {
            const log = slog.stepIn(LoginApp.CLS_NAME, 'login');
            try
            {
                const res = await Api.loginEmail(param);

                if (res.message)
                {
                    this.store.message = res.message;
                    this.render();
                }
                else
                {
                    location.href = (res.smsId === undefined ? '/' : `?id=${res.smsId}`);
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

/**
 * onLoad
 */
window.addEventListener('DOMContentLoaded', () =>
{
    document.cookie = 'command=; expires=Thu, 01 Jan 1970 00:00:00 GMT';
    const app = new LoginApp();
    app.render();
});

if (window.location.hash === '#_=_')
{
    // Facebookのコールバックでなぜかゴミが付いてくるので取り除く。
    window.history.pushState('', document.title, window.location.pathname);
}
