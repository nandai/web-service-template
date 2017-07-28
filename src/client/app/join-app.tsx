/**
 * (C) 2016-2017 printf.jp
 */
import bind        from 'bind-decorator';
import * as React  from 'react';

import SignupApi   from 'client/api/signup-api';
import {App}       from 'client/app/app';
import JoinView    from 'client/components/views/join-view';
import {storeNS}   from 'client/components/views/join-view/store';
import Utils       from 'client/libs/utils';
import {Response}  from 'libs/response';
import {slog}      from 'libs/slog';
import CommonUtils from 'libs/utils';

const ssrStore = Utils.getSsrStore<storeNS.Store>();

/**
 * join app
 */
export default class JoinApp extends App
{
    private static CLS_NAME = 'JoinApp';
    private store : storeNS.Store;

    /**
     * @constructor
     */
    constructor()
    {
        super();
        this.store = storeNS.init(ssrStore);
        this.store.onPasswordChange = this.onPasswordChange;
        this.store.onJoin =           this.onJoin;
    }

    /**
     * view
     */
    view() : JSX.Element
    {
        return <JoinView store={this.store} />;
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
     * onJoin
     */
    @bind
    private async onJoin()
    {
        const log = slog.stepIn(JoinApp.CLS_NAME, 'onSend');
        const {store} = this;

        try
        {
            const params = CommonUtils.parseRawQueryString(location.search.substring(1));
            const inviteId : string = params.id;
            const password = store.password;
            const res : Response.Join = await SignupApi.join({inviteId, password});
            store.joinResponse = res;
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
