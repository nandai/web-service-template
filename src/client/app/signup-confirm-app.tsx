/**
 * (C) 2016-2017 printf.jp
 */
import bind              from 'bind-decorator';
import * as React        from 'react';

import SignupApi         from 'client/api/signup-api';
import {App}             from 'client/app/app';
import SignupConfirmView from 'client/components/views/signup-confirm-view';
import {storeNS}         from 'client/components/views/signup-confirm-view/store';
import R                 from 'client/libs/r';
import {Response}        from 'libs/response';
import {slog}            from 'libs/slog';
import CommonUtils       from 'libs/utils';

/**
 * signup confirm app
 */
export default class SignupConfirmApp extends App
{
    private static CLS_NAME = 'SignupConfirmApp';
    store : storeNS.Store;

    /**
     * @constructor
     */
    constructor(ssrStore : storeNS.Store)
    {
        super();

        this.store = storeNS.init(ssrStore);
        this.url = '/signup';
        this.query = true;
        this.title = R.text(R.SIGNUP_CONFIRM, this.store.locale);

        this.store.onPasswordChange = this.onPasswordChange;
        this.store.onConfirm =        this.onConfirm;
    }

    /**
     * toString
     */
    toString() : string
    {
        return 'SignupConfirmApp';
    }

    /**
     * factory
     */
    factory(store : storeNS.Store) : App
    {
        return new SignupConfirmApp(store);
    }

    /**
     * view
     */
    view(i : number) : JSX.Element
    {
        return <SignupConfirmView key={i} store={this.store} />;
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
     * onConfirm
     */
    @bind
    private async onConfirm()
    {
        const log = slog.stepIn(SignupConfirmApp.CLS_NAME, 'onConfirm');
        const {store} = this;

        try
        {
            const params = CommonUtils.parseRawQueryString(location.search.substring(1));
            const signupId : string = params.id;
            const password = store.password;
            const res : Response.ConfirmSignupEmail = await SignupApi.confirmSignupEmail({signupId, password});
            store.confirmSignupEmailResponse = res;
            App.render();
            log.stepOut();
        }
        catch (err)
        {
            store.message = err.message;
            App.render();
            log.stepOut();
        }
    }
}
