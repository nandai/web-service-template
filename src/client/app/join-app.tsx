/**
 * (C) 2016-2017 printf.jp
 */
import bind        from 'bind-decorator';
import * as React  from 'react';

import {Request}   from 'libs/request';
import {Response}  from 'libs/response';
import CommonUtils from 'libs/utils';
import SignupApi   from '../api/signup-api';
import JoinView    from '../components/views/join-view';
import {Store}     from '../components/views/join-view/store';
import Utils       from '../libs/utils';
import {App}       from './app';

const slog = window['slog'];

/**
 * join app
 */
export default class JoinApp extends App
{
    private static CLS_NAME = 'JoinApp';
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
            onPasswordChange: this.onPasswordChange,
            onJoin:           this.onJoin,
        };
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
    private onPasswordChange(e : React.ChangeEvent<HTMLInputElement>) : void
    {
        this.store.password = e.target.value;
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
