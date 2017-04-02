/**
 * (C) 2016-2017 printf.jp
 */
import * as React    from 'react';
import * as ReactDOM from 'react-dom';
import {Store}       from '../components/views/sms-view/store';
import SmsView       from '../components/views/sms-view/sms-view';
import Api           from '../utils/api';

const slog =  window['slog'];
const smsId = window['message'];

/**
 * View
 */
class SmsApp
{
    private static CLS_NAME = 'SmsView';
    private store : Store;

    /**
     * @constructor
     */
    constructor()
    {
        this.store = {
            smsCode: '',
            message: '',
            onSmsCodeChange: this.onSmsCodeChange.bind(this),
            onSend:          this.onSend.         bind(this)
        };
    }

    /**
     * render
     */
    render() : void
    {
        ReactDOM.render(
            <SmsView store={this.store} />,
            document.getElementById('root'));
    }

    /**
     * onSmsCodeChange
     */
    private onSmsCodeChange(e : React.ChangeEvent<HTMLInputElement>) : void
    {
        this.store.smsCode = e.target.value;
        this.render();
    }

    /**
     * onSend
     */
    private async onSend()
    {
        const log = slog.stepIn(SmsApp.CLS_NAME, 'onSend');
        try
        {
            const smsCode = this.store.smsCode;
            const message = await Api.loginSms({smsId, smsCode});

            if (message === null)
            {
                location.href = '/';
            }
            else
            {
                this.store.message = message;
                this.render();
            }

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
    const app = new SmsApp();
    app.render();
});
