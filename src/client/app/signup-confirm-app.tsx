/**
 * (C) 2016-2017 printf.jp
 */
import * as React        from 'react';

import {Request}         from 'libs/request';
import {Response}        from 'libs/response';
import CommonUtils       from 'libs/utils';
import SignupApi         from '../api/signup-api';
import SignupConfirmView from '../components/views/signup-confirm-view';
import {Store}           from '../components/views/signup-confirm-view/store';
import Utils             from '../libs/utils';
import {App}             from './app';

const slog = window['slog'];

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
            message:  '',
            onPasswordChange: this.onPasswordChange.bind(this),
            onConfirm:        this.onConfirm.       bind(this)
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
    private onPasswordChange(e : React.ChangeEvent<HTMLInputElement>) : void
    {
        this.store.password = e.target.value;
        this.render();
    }

    /**
     * onConfirm
     */
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
            store.message = res.message;
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
