/**
 * (C) 2016-2017 printf.jp
 */
import bind        from 'bind-decorator';
import * as React  from 'react';

import {Response}  from 'libs/response';
import CommonUtils from 'libs/utils';
import ResetApi    from '../api/reset-api';
import ResetView   from '../components/views/reset-view';
import {Store}     from '../components/views/reset-view/store';
import Utils       from '../libs/utils';
import {App}       from './app';

const slog = window['slog'];
const ssrStore = Utils.getSsrStore<Store>();

/**
 * reset app
 */
export default class ResetApp extends App
{
    private static CLS_NAME = 'ResetApp';
    private store : Store;

    /**
     * @constructor
     */
    constructor()
    {
        super();
        this.store =
        {
            locale:                Utils.getLocale(),
            password:              '',
            confirm:               '',
            resetPasswordResponse: ssrStore.resetPasswordResponse,
            message:               '',
            onPasswordChange:      this.onPasswordChange,
            onConfirmChange:       this.onConfirmChange,
            onChange:              this.onChange,
        };
    }

    /**
     * view
     */
    view() : JSX.Element
    {
        return <ResetView store={this.store} />;
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
     * onConfirmChange
     */
    @bind
    private onConfirmChange(value : string) : void
    {
        this.store.confirm = value;
        this.render();
    }

    /**
     * onChange
     */
    @bind
    private async onChange()
    {
        const log = slog.stepIn(ResetApp.CLS_NAME, 'onChange');
        const {store} = this;

        try
        {
            const params = CommonUtils.parseRawQueryString(location.search.substring(1));
            const resetId : string = params.id;
            const {password, confirm} = store;
            const res : Response.ResetPassword = await ResetApi.resetPassword({resetId, password, confirm});
            store.resetPasswordResponse = res;
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
