/**
 * (C) 2016-2017 printf.jp
 */
import bind       from 'bind-decorator';
import * as React from 'react';

import ResetApi   from 'client/api/reset-api';
import {App}      from 'client/app/app';
import ForgetView from 'client/components/views/forget-view';
import {storeNS}  from 'client/components/views/forget-view/store';
import Utils      from 'client/libs/utils';
import {Response} from 'libs/response';
import {slog}     from 'libs/slog';

/**
 * forget app
 */
export default class ForgetApp extends App
{
    private static CLS_NAME = 'ForgetApp';
    store : storeNS.Store;

    /**
     * @constructor
     */
    constructor(ssrStore? : storeNS.Store)
    {
        super();

        if (! ssrStore) {
            ssrStore = Utils.getSsrStore<storeNS.Store>();
        }

        this.store = storeNS.init(ssrStore);
        this.store.onEmailChange = this.onEmailChange;
        this.store.onSend =        this.onSend;
        this.store.onBack =        this.onBack;
    }

    /**
     * toString
     */
    toString() : string
    {
        return 'ForgetApp';
    }

    /**
     * 初期化
     */
    init(params, _message? : string)
    {
        this.store = storeNS.init(this.store);
        return super.init(params);
    }

    /**
     * view
     */
    view(i : number) : JSX.Element
    {
        return <ForgetView key={i} store={this.store} />;
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

        store.message = '';
        store.requestResetPasswordResult.message = {};
        store.loading = true;
        this.render();

        try
        {
            const res : Response.RequestResetPassword = await ResetApi.requestResetPassword({email:this.store.email});
            store.requestResetPasswordResult = res;
            store.loading = false;
            this.render();
            log.stepOut();
        }
        catch (err)
        {
            store.message = err.message;
            store.loading = false;
            this.render();
            log.stepOut();
        }
    }
}
