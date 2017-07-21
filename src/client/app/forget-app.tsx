/**
 * (C) 2016-2017 printf.jp
 */
import bind       from 'bind-decorator';
import * as React from 'react';

import ResetApi   from 'client/api/reset-api';
import {App}      from 'client/app/app';
import ForgetView from 'client/components/views/forget-view';
import {Store}    from 'client/components/views/forget-view/store';
import {slog}     from 'client/libs/slog';
import Utils      from 'client/libs/utils';
import {Response} from 'libs/response';

const ssrStore = Utils.getSsrStore<Store>();

/**
 * forget app
 */
export default class ForgetApp extends App
{
    private static CLS_NAME = 'ForgetApp';
    private store : Store;

    /**
     * @constructor
     */
    constructor()
    {
        super();
        this.store =
        {
            locale:                     Utils.getLocale(),
            requestResetPasswordResult: ssrStore.requestResetPasswordResult,
            onEmailChange:              this.onEmailChange,
            onSend:                     this.onSend,
            onBack:                     this.onBack,
        };
    }

    /**
     * 初期化
     */
    init(params, _message? : string)
    {
        const {store} = this;
        store.email =   '';
        store.requestResetPasswordResult = {status:Response.Status.OK, message:{}};
        store.message = '';
        return super.init(params);
    }

    /**
     * view
     */
    view() : JSX.Element
    {
        return <ForgetView store={this.store} />;
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
     * onSend
     */
    @bind
    private async onSend()
    {
        const log = slog.stepIn(ForgetApp.CLS_NAME, 'onSend');
        const {store} = this;

        try
        {
            const res : Response.RequestResetPassword = await ResetApi.requestResetPassword({email:this.store.email});
            store.requestResetPasswordResult = res;
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
