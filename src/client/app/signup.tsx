/**
 * (C) 2016-2017 printf.jp
 */
import * as React from 'react';

import {Request}  from 'libs/request';
import SignupApi  from '../api/signup-api';
import SignupView from '../components/views/signup-view/signup-view';
import {Store}    from '../components/views/signup-view/store';
import History    from '../libs/history';
import Utils      from '../libs/utils';
import {App}      from './app';

const slog = window['slog'];
const ssrStore = Utils.getSsrStore<Store>();

/**
 * signup app
 */
export default class SignupApp extends App
{
    private static CLS_NAME = 'SignupApp';
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
            email:            '',
            password:         '',
            message:          ssrStore.message,
            onTwitter:        this.onTwitter.       bind(this),
            onFacebook:       this.onFacebook.      bind(this),
            onGoogle:         this.onGoogle.        bind(this),
            onGithub:         this.onGithub.        bind(this),
            onEmailChange:    this.onEmailChange.   bind(this),
            onPasswordChange: this.onPasswordChange.bind(this),
            onSignup:         this.onSignup.        bind(this),
            onTop:            this.onTop.           bind(this)
        };
    }

    /**
     * 初期化
     */
    init(params, message? : string)
    {
        const {store} = this;
        store.email =    '',
        store.password = '',
        store.message =  '';
        return super.init(params);
    }

    /**
     * view
     */
    view() : JSX.Element
    {
        return <SignupView store={this.store} />;
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
     * onGithub
     */
    private onGithub() : void
    {
        const log = slog.stepIn(SignupApp.CLS_NAME, 'onGithub');
        location.href = '/signup/github';
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
            await this.signup(
            {
                email:    this.store.email,
                password: this.store.password
            });
            log.stepOut();
        }
        catch (err) {log.stepOut();}
    }

    /**
     * onTop
     */
    private onTop() : void
    {
        const log = slog.stepIn(SignupApp.CLS_NAME, 'onTop');
//      History.back(); // SNSサインアップに失敗して戻ってきた場合に、back()では'/signup'になってしまう
        History.replaceState('/');
        log.stepOut();
    }

    /**
     * signup
     */
    private signup(param : Request.SignupEmail)
    {
        return new Promise(async (resolve : () => void, reject) =>
        {
            const log = slog.stepIn(SignupApp.CLS_NAME, 'signup');
            const {store} = this;

            store.message = '';
            this.render();

            try
            {
                const res = await SignupApi.signupEmail(param);

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
