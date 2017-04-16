/**
 * (C) 2016-2017 printf.jp
 */
import * as React    from 'react';
import * as ReactDOM from 'react-dom';
import {App}         from './app';
import LoginApi      from '../api/login-api';
import SmsView       from '../components/views/sms-view/sms-view';
import {Store}       from '../components/views/sms-view/store';
import Utils         from '../libs/utils';
import CommonUtils   from 'libs/utils';

const slog = window['slog'];

/**
 * View
 */
export default class SmsApp extends App
{
    private static CLS_NAME = 'SmsView';
    private store : Store;

    /**
     * @constructor
     */
    constructor()
    {
        super();
        this.store =
        {
            locale:  Utils.getLocale(),
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
        const {store} = this;

        try
        {
            const params = CommonUtils.parseRawQueryString(location.search.substring(1));
            const smsId : string = params.id;
            const smsCode = store.smsCode;
            const res = await LoginApi.loginSms({smsId, smsCode});

            if (res.status === 0)
            {
                location.href = '/';
            }
            else
            {
                store.message = res.message;
                this.render();
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
