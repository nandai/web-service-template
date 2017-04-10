/**
 * (C) 2016-2017 printf.jp
 */
import * as React    from 'react';
import * as ReactDOM from 'react-dom';
import ResetApi      from '../api/reset-api';
import ResetView     from '../components/views/reset-view/reset-view';
import {Store}       from '../components/views/reset-view/store';
import Utils         from '../libs/utils';

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
        this.store =
        {
            locale:   Utils.getLocale(),
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
        const {store} = this;

        try
        {
            const {password, confirm} = store;
            const res = await ResetApi.resetPassword({resetId, password, confirm});
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

window.addEventListener('DOMContentLoaded', () =>
{
    const app = new ResetApp();
    app.render();
});
