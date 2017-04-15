/**
 * (C) 2016-2017 printf.jp
 */
import * as React    from 'react';
import * as ReactDOM from 'react-dom';
import {Request}     from 'libs/request';
import LoginApi      from '../api/login-api';
import LoginView     from '../components/views/login-view/login-view';
import {Store}       from '../components/views/login-view/store';
import History       from '../libs/history';
import Utils         from '../libs/utils';

const slog =     window['slog'];
const ssrStore = window['ssrStore'];

/**
 * View
 */
export default class LoginApp
{
    private static CLS_NAME = 'LoginApp';
    private store : Store;

    /**
     * @constructor
     */
    constructor()
    {
        this.store =
        {
            locale:   Utils.getLocale(),
            email:    '',
            password: '',
            message:  ssrStore.message,
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
     * 初期化
     */
    init() : void
    {
        document.cookie = 'command=; expires=Thu, 01 Jan 1970 00:00:00 GMT';
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
     * login
     */
    private login(sns : string, param : Request.LoginEmail)
    {
        return new Promise(async (resolve : () => void, reject) =>
        {
            const log = slog.stepIn(LoginApp.CLS_NAME, 'login');
            try
            {
                const res = await LoginApi.loginEmail(param);

                if (res.message)
                {
                    this.store.message = res.message;
                    this.render();
                }
                else
                {
                    if (res.smsId === undefined)
                    {
                        location.href = '/';
                    }
                    else
                    {
                        ssrStore.smsId = res.smsId;
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
