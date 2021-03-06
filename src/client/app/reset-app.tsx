/**
 * (C) 2016-2017 printf.jp
 */
import bind        from 'bind-decorator';
import * as React  from 'react';

import ResetApi    from 'client/api/reset-api';
import {App}       from 'client/app/app';
import ResetView   from 'client/components/views/reset-view';
import {storeNS}   from 'client/components/views/reset-view/store';
import R           from 'client/libs/r';
import {Response}  from 'libs/response';
import {slog}      from 'libs/slog';
import CommonUtils from 'libs/utils';

/**
 * reset app
 */
export default class ResetApp extends App
{
    private static CLS_NAME = 'ResetApp';
    store : storeNS.Store;

    /**
     * @constructor
     */
    constructor(ssrStore : storeNS.Store)
    {
        super();

        this.store = storeNS.init(ssrStore);
        this.url = '/reset';
        this.query = true;
        this.title = R.text(R.RESET_PASSWORD, this.store.locale);

        this.store.onPasswordChange = this.onPasswordChange;
        this.store.onConfirmChange =  this.onConfirmChange;
        this.store.onChange =         this.onChange;
    }

    /**
     * toString
     */
    toString() : string
    {
        return 'ResetApp';
    }

    /**
     * factory
     */
    factory(store : storeNS.Store) : App
    {
        return new ResetApp(store);
    }

    /**
     * view
     */
    view(i : number) : JSX.Element
    {
        return <ResetView key={i} store={this.store} />;
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
     * onConfirmChange
     */
    @bind
    private onConfirmChange(value : string) : void
    {
        this.store.confirm = value;
        App.render();
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
