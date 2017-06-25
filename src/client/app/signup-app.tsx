/**
 * (C) 2016-2017 printf.jp
 */
import bind       from 'bind-decorator';
import * as React from 'react';

import {Request}  from 'libs/request';
import {Response} from 'libs/response';
import SignupApi  from '../api/signup-api';
import SignupView from '../components/views/signup-view';
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
            locale:              Utils.getLocale(),
            email:               '',
            password:            '',
            signupEmailResponse: ssrStore.signupEmailResponse,
            message:             ssrStore.message,
            onTwitter:           this.onTwitter,
            onFacebook:          this.onFacebook,
            onGoogle:            this.onGoogle,
            onGithub:            this.onGithub,
            onEmailChange:       this.onEmailChange,
            onPasswordChange:    this.onPasswordChange,
            onSignup:            this.onSignup,
            onTop:               this.onTop,
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
        store.signupEmailResponse = {status:Response.Status.OK, message:{}};
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
    @bind
    private onTwitter() : void
    {
        const log = slog.stepIn(SignupApp.CLS_NAME, 'onTwitter');
        location.href = '/signup/twitter';
        log.stepOut();
    }

    /**
     * onFacebook
     */
    @bind
    private onFacebook() : void
    {
        const log = slog.stepIn(SignupApp.CLS_NAME, 'onFacebook');
        location.href = '/signup/facebook';
        log.stepOut();
    }

    /**
     * onGoogle
     */
    @bind
    private onGoogle() : void
    {
        const log = slog.stepIn(SignupApp.CLS_NAME, 'onGoogle');
        location.href = '/signup/google';
        log.stepOut();
    }

    /**
     * onGithub
     */
    @bind
    private onGithub() : void
    {
        const log = slog.stepIn(SignupApp.CLS_NAME, 'onGithub');
        location.href = '/signup/github';
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
     * onSignup
     */
    @bind
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
    @bind
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
                const res : Response.SignupEmail = await SignupApi.signupEmail(param);
                store.signupEmailResponse = res;
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
