/**
 * (C) 2016-2017 printf.jp
 */
import * as React        from 'react';
import * as ReactDOM     from 'react-dom';
import {Store}           from '../components/views/signup-confirm-view/store';
import SignupConfirmView from '../components/views/signup-confirm-view/signup-confirm-view';
import Api               from '../utils/api';

const slog =     window['slog'];
const signupId = window['message'];

/**
 * View
 */
class SignupConfirmApp
{
    private static CLS_NAME = 'SignupConfirmApp';
    private store : Store;

    /**
     * @constructor
     */
    constructor()
    {
        this.store = {
            password: '',
            message:  '',
            onPasswordChange: this.onPasswordChange.bind(this),
            onConfirm:        this.onConfirm.       bind(this)
        };
    }

    /**
     * render
     */
    render() : void
    {
        ReactDOM.render(
            <SignupConfirmView store={this.store} />,
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
     * onConfirm
     */
    private async onConfirm()
    {
        const log = slog.stepIn(SignupConfirmApp.CLS_NAME, 'onConfirm');
        const {store} = this;

        try
        {
            const res = await Api.confirmSignup(signupId, store.password);

            if (res.message)
            {
                store.message = res.message;
                this.render();
            }
            else
            {
                location.href = res.redirect;
            }

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

window.addEventListener('DOMContentLoaded', () => {
    const app = new SignupConfirmApp();
    app.render();
});
