/**
 * (C) 2016-2017 printf.jp
 */
import bind       from 'bind-decorator';
import * as React from 'react';

import {Response} from 'libs/response';
import ResetApi   from '../api/reset-api';
import ForgetView from '../components/views/forget-view';
import {Store}    from '../components/views/forget-view/store';
import Utils      from '../libs/utils';
import {App}      from './app';

const slog = window['slog'];

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
            locale:        Utils.getLocale(),
            onEmailChange: this.onEmailChange,
            onSend:        this.onSend,
            onBack:        this.onBack,
        };
    }

    /**
     * 初期化
     */
    init(params, message? : string)
    {
        const {store} = this;
        store.email =   '';
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
