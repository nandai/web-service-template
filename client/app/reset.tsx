/**
 * (C) 2016-2017 printf.jp
 */
import * as React    from 'react';
import * as ReactDOM from 'react-dom';
import {Store}       from '../components/views/reset-view/store';
import ResetView     from '../components/views/reset-view/reset-view';
import Api           from '../utils/api';

const slog =    window['slog'];
const resetId = window['message'];

/**
 * View
 */
class ResetApp
{
    private static CLS_NAME = 'ResetApp';
    private store : Store;

    /**
     * @constructor
     */
    constructor()
    {
        this.store = {
            password: '',
            confirm:  '',
            message:  '',
            onPasswordChange: this.onPasswordChange.bind(this),
            onConfirmChange:  this.onConfirmChange. bind(this),
            onChange:         this.onChange.        bind(this)
        };
    }

    /**
     * render
     */
    render() : void
    {
        ReactDOM.render(
            <ResetView store={this.store} />,
            document.getElementById('root'));
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
     * onConfirmChange
     */
    private onConfirmChange(e : React.ChangeEvent<HTMLInputElement>) : void
    {
        this.store.confirm = e.target.value;
        this.render();
    }

    /**
     * onChange
     */
    private async onChange()
    {
        const log = slog.stepIn(ResetApp.CLS_NAME, 'onChange');
        try
        {
            const {store} = this;
            store.message = await Api.resetPassword(resetId, store.password, store.confirm);
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
    const app = new ResetApp();
    app.render();
});
