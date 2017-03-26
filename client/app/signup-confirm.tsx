/**
 * (C) 2016-2017 printf.jp
 */
import * as React        from 'react';
import * as ReactDOM     from 'react-dom';
import {Store}           from '../components/views/signup-confirm-view/store';
import SignupConfirmView from '../components/views/signup-confirm-view/signup-confirm-view';

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
    private onConfirm() : void
    {
        const log = slog.stepIn(SignupConfirmApp.CLS_NAME, 'onConfirm');
        const {store} = this;
        const data =
        {
            signupId: signupId,
            password: this.store.password
        };

        $.ajax({
            type: 'POST',
            url: `/api/signup/email/confirm`,
            data: data
        })

        .done((data, status, jqXHR) =>
        {
            const log = slog.stepIn(SignupConfirmApp.CLS_NAME, 'signup-confirm.done');

            if (data.status === 0)
            {
                location.href = data.redirect;
            }
            else
            {
                store.message = data.message;
                this.render();
            }

            log.stepOut();
        })

        .fail((jqXHR, status, error) =>
        {
            const log = slog.stepIn(SignupConfirmApp.CLS_NAME, 'signup-confirm.fail');
            log.stepOut();
        });

        log.stepOut();
    }
}

window.addEventListener('DOMContentLoaded', () => {
    const app = new SignupConfirmApp();
    app.render();
});
