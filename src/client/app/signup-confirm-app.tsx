/**
 * (C) 2016-2017 printf.jp
 */
import bind              from 'bind-decorator';
import * as React        from 'react';

import SignupApi         from 'client/api/signup-api';
import {App}             from 'client/app/app';
import SignupConfirmView from 'client/components/views/signup-confirm-view';
import {Store}           from 'client/components/views/signup-confirm-view/store';
import {slog}            from 'client/libs/slog';
import Utils             from 'client/libs/utils';
import {Response}        from 'libs/response';
import CommonUtils       from 'libs/utils';

const ssrStore = Utils.getSsrStore<Store>();

/**
 * signup confirm app
 */
export default class SignupConfirmApp extends App
{
    private static CLS_NAME = 'SignupConfirmApp';
    private store : Store;

    /**
     * @constructor
     */
    constructor()
    {
        super();
        this.store =
        {
            locale:   Utils.getLocale(),
            password: '',
            confirmSignupEmailResponse: ssrStore.confirmSignupEmailResponse,
            message:  '',
            onPasswordChange: this.onPasswordChange,
            onConfirm:        this.onConfirm,
        };
    }

    /**
     * view
     */
    view() : JSX.Element
    {
        return <SignupConfirmView store={this.store} />;
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
            this.render();
            log.stepOut();
        }
        catch (err)
        {
            store.message = err.message;
            this.render();
            log.stepOut();
        }
    }
}
