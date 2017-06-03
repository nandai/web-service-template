/**
 * (C) 2016-2017 printf.jp
 */
import bind        from 'bind-decorator';
import * as React  from 'react';

import {Response}  from 'libs/response';
import CommonUtils from 'libs/utils';
import LoginApi    from '../api/login-api';
import SmsView     from '../components/views/sms-view';
import {Store}     from '../components/views/sms-view/store';
import History     from '../libs/history';
import Utils       from '../libs/utils';
import {App}       from './app';

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
            onSmsCodeChange: this.onSmsCodeChange,
            onSend:          this.onSend,
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
        if (this.store.onSend && this.approvalTimerId === 0) {
            this.setPollingTimer();
        }

        return <SmsView store={this.store} />;
    }

    /**
     * onSmsCodeChange
     */
    @bind
    private onSmsCodeChange(value : string) : void
    {
        this.store.smsCode = value;
        this.render();
    }

    /**
     * onSend
     */
    @bind
    private async onSend()
    {
        const log = slog.stepIn(SmsApp.CLS_NAME, 'onSend');
        const {store} = this;

        try
        {
            const params = CommonUtils.parseRawQueryString(location.search.substring(1));
            const smsId : string = params.id;
            const {smsCode} = store;
            const res : Response.LoginSms = await LoginApi.loginSms({smsId, smsCode});

            if (res.status === Response.Status.OK)
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
    @bind
    private async pollingAuthyOneTouchApprival()
    {
        const res : Response.LoginAuthyOneTouch = await LoginApi.loginAuthyOneTouch();

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
        this.approvalTimerId = setTimeout(this.pollingAuthyOneTouchApprival, 1000) as any;
    }

    /**
     * ポーリングタイマーをクリア
     */
    private clearPollingTimer() : void
    {
        if (this.approvalTimerId) {
            clearTimeout(this.approvalTimerId);
        }

        this.approvalTimerId = 0;
    }
}
