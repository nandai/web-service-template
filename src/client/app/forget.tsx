/**
 * (C) 2016-2017 printf.jp
 */
import * as React    from 'react';
import * as ReactDOM from 'react-dom';
import {App}         from './app';
import ResetApi      from '../api/reset-api';
import ForgetView    from '../components/views/forget-view/forget-view';
import {Store}       from '../components/views/forget-view/store';
import Utils         from '../libs/utils';

const slog =  window['slog'];

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
            onEmailChange: this.onEmailChange.bind(this),
            onSend:        this.onSend.       bind(this)
        };
    }

    /**
     * 初期化
     */
    init() : void
    {
        const {store} = this;
        store.email =   '';
        store.message = '';
    }

    /**
     * render
     */
    render() : void
    {
        ReactDOM.render(
            <ForgetView store={this.store} />,
            document.getElementById('root'));
    }

    /**
     * onEmailChange
     */
    private onEmailChange(e : React.ChangeEvent<HTMLInputElement>) : void
    {
        this.store.email = e.target.value;
        this.render();
    }

    /**
     * onSend
     */
    private async onSend()
    {
        const log = slog.stepIn(ForgetApp.CLS_NAME, 'onSend');
        const {store} = this;

        try
        {
            const res = await ResetApi.requestResetPassword({email:this.store.email});
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
