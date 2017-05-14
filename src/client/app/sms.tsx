/**
 * (C) 2016-2017 printf.jp
 */
import * as React  from 'react';
import CommonUtils from 'libs/utils';
import {App}       from './app';
import LoginApi    from '../api/login-api';
import SmsView     from '../components/views/sms-view/sms-view';
import {Store}     from '../components/views/sms-view/store';
import History     from '../libs/history';
import Utils       from '../libs/utils';

const slog = window['slog'];

/**
 * sms app
 */
export default class SmsApp extends App
{
    private static CLS_NAME = 'SmsView';
    private store : Store;
    private approvalTimerId = 0;

    /**
     * @constructor
     */
    constructor()
    {
        super();
        this.store =
        {
            locale:          Utils.getLocale(),
            onSmsCodeChange: this.onSmsCodeChange.bind(this),
            onSend:          this.onSend.         bind(this)
        };
    }

    /**
     * 初期化
     */
    init(params, message? : string)
    {
        const {store} = this;
        store.smsCode = '';
        store.message = '';
        return super.init(params);
    }

    /**
     * view
     */
    view() : JSX.Element
    {
        if (this.store.onSend && this.approvalTimerId === 0)
            this.setPollingTimer();

        return <SmsView store={this.store} />;
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
            const {smsCode} = store;
            const res = await LoginApi.loginSms({smsId, smsCode});

            if (res.status === 0)
            {
                this.clearPollingTimer();
                History.replaceState('/');
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

    /**
     * Authy OneTouch
     */
    private async pollingAuthyOneTouchApprival()
    {
        const res = await LoginApi.loginAuthyOneTouch();

        if (res.approval)
        {
            this.clearPollingTimer();
            History.replaceState('/');
        }
        else
        {
            this.setPollingTimer();
        }
    }

    /**
     * ポーリングタイマーを設定
     */
    private setPollingTimer() : void
    {
        this.approvalTimerId = setTimeout(this.pollingAuthyOneTouchApprival.bind(this), 500);
    }

    /**
    * ポーリングタイマーをクリア
     */
    private clearPollingTimer() : void
    {
        if (this.approvalTimerId)
            clearTimeout(this.approvalTimerId);

        this.approvalTimerId = 0;
    }
}
