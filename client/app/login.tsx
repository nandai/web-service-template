/**
 * (C) 2016-2017 printf.jp
 */
import * as React    from 'react';
import * as ReactDOM from 'react-dom';
import {Store}       from '../components/views/login-view/store';
import LoginView     from '../components/views/login-view/login-view';

const slog =  window['slog'];

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
            message:  '',
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
    private onLogin() : void
    {
        const log = slog.stepIn(LoginApp.CLS_NAME, 'onLogin');
        this.login('email',
        {
            email:    this.store.email,
            password: this.store.password
        });
        log.stepOut();
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
    private login(sns : string, data?) : void
    {
        const log = slog.stepIn(LoginApp.CLS_NAME, 'login');

        $.ajax({
            type: 'POST',
            url: `/api/login/${sns}`,
            data: data
        })

        .done((data, status, jqXHR) =>
        {
            const log = slog.stepIn(LoginApp.CLS_NAME, 'login.done');

            if (data.status === 0)
            {
                location.href = (data.smsId === undefined ? '/' : `?id=${data.smsId}`);
            }
            else
            {
                this.store.message = data.message;
                this.render();
            }

            log.stepOut();
        })

        .fail((jqXHR, status, error) =>
        {
            const log = slog.stepIn(LoginApp.CLS_NAME, 'login.fail');
            log.stepOut();
        });

        log.stepOut();
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
