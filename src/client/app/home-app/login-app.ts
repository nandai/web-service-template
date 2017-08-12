/**
 * (C) 2016-2017 printf.jp
 */
import bind       from 'bind-decorator';

import LoginApi   from 'client/api/login-api';
import {App}      from 'client/app/app';
import {storeNS}  from 'client/components/views/login-view/store';
import History    from 'client/libs/history';
import {Request}  from 'libs/request';
import {Response} from 'libs/response';
import {slog}     from 'libs/slog';

export default class LoginApp extends App
{
    private static CLS_NAME = 'LoginApp';
    store : storeNS.LoginStore;

    /**
     * @constructor
     */
    constructor(store : storeNS.LoginStore)
    {
        super();

        this.store = store;
        this.store.onTwitter =        this.onTwitter;
        this.store.onFacebook =       this.onFacebook;
        this.store.onGoogle =         this.onGoogle;
        this.store.onGithub =         this.onGithub;
        this.store.onEmailChange =    this.onEmailChange;
        this.store.onPasswordChange = this.onPasswordChange;
        this.store.onLogin =          this.onLogin;
        this.store.onSignup =         this.onSignup;
        this.store.onForget =         this.onForget;
        this.store.onUsers =          this.onUsers;
    }

    /**
     * toString
     */
    toString() : string
    {
        return 'LoginApp';
    }

    /**
     * view
     */
    view(_i : number) : JSX.Element
    {
        return null;
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
        App.render();
    }

    /**
     * onPasswordChange
     */
    @bind
    private onPasswordChange(value : string) : void
    {
        this.store.password = value;
        App.render();
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
                    App.render();
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
                App.render();
                log.stepOut();
                reject();
            }
        });
    }
}
