/**
 * (C) 2016-2017 printf.jp
 */
import * as React    from 'react';
import * as ReactDOM from 'react-dom';
import {Store}       from '../components/views/signup-view/store';
import SignupView    from '../components/views/signup-view/signup-view';
import Api           from '../utils/api';

const slog =  window['slog'];

/**
 * View
 */
class SignupApp
{
    private static CLS_NAME = 'SignupApp';
    private store : Store;

    /**
     * @constructor
     */
    constructor()
    {
        this.store = {
            email:    '',
            password: '',
            message:  window['message'],
            onTwitter:        this.onTwitter.       bind(this),
            onFacebook:       this.onFacebook.      bind(this),
            onGoogle:         this.onGoogle.        bind(this),
            onEmailChange:    this.onEmailChange.   bind(this),
            onPasswordChange: this.onPasswordChange.bind(this),
            onSignup:         this.onSignup.        bind(this),
            onTop:            this.onTop.           bind(this)
        };
    }

    /**
     * render
     */
    render() : void
    {
        ReactDOM.render(
            <SignupView store={this.store} />,
            document.getElementById('root'));
    }

    /**
     * onTwitter
     */
    private onTwitter() : void
    {
        const log = slog.stepIn(SignupApp.CLS_NAME, 'onTwitter');
        location.href = '/signup/twitter';
        log.stepOut();
    }

    /**
     * onFacebook
     */
    private onFacebook() : void
    {
        const log = slog.stepIn(SignupApp.CLS_NAME, 'onFacebook');
        location.href = '/signup/facebook';
        log.stepOut();
    }

    /**
     * onGoogle
     */
    private onGoogle() : void
    {
        const log = slog.stepIn(SignupApp.CLS_NAME, 'onGoogle');
        location.href = '/signup/google';
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
     * onSignup
     */
    private async onSignup()
    {
        const log = slog.stepIn(SignupApp.CLS_NAME, 'onSignup');
        try
        {
            await this.signup('email',
            {
                email:    this.store.email,
                password: this.store.password
            });
            log.stepOut();
        }
        catch (err) {log.stepOut()}
    }

    /**
     * onTop
     */
    private onTop() : void
    {
        const log = slog.stepIn(SignupApp.CLS_NAME, 'onTop');
        location.href = '/';
        log.stepOut();
    }

    /**
     * signup
     */
    private signup(sns : string, data?)
    {
        return new Promise(async (resolve : () => void, reject) =>
        {
            const log = slog.stepIn(SignupApp.CLS_NAME, 'signup');
            const {store} = this;

            store.message = '';
            this.render();

            try
            {
                const message = await Api.signup(sns, data);

                if (message === null)
                {
                    location.href = '/';
                }
                else
                {
                    store.message = message;
                    this.render();
                }

                log.stepOut();
                resolve();
            }
            catch (err)
            {
                log.stepOut();
                reject(err);
            }
        });
    }
}

window.addEventListener('DOMContentLoaded', () => {
    const app = new SignupApp();
    app.render();
});

if (window.location.hash === '#_=_')
    window.history.pushState('', document.title, window.location.pathname);
