/**
 * (C) 2016-2017 printf.jp
 */
import * as React    from 'react';
import * as ReactDOM from 'react-dom';
import {Store}       from '../components/views/forget-view/store';
import ForgetView    from '../components/views/forget-view/forget-view';
import ResetApi      from '../api/reset-api';

const slog =  window['slog'];

/**
 * View
 */
class ForgetApp
{
    private static CLS_NAME = 'ForgetApp';
    private store : Store;

    /**
     * @constructor
     */
    constructor()
    {
        this.store = {
            email:    '',
            message:  '',
            onEmailChange: this.onEmailChange.bind(this),
            onSend:        this.onSend.       bind(this)
        };
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
        try
        {
            this.store.message = await ResetApi.requestResetPassword({email:this.store.email});
            this.render();
            log.stepOut();
        }
        catch (err)
        {
            this.store.message = err.message;
            this.render();
            log.stepOut();
        }
    }
}

window.addEventListener('DOMContentLoaded', () =>
{
    const app = new ForgetApp();
    app.render();
});
