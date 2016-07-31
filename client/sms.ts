/**
 * (C) 2016 printf.jp
 */

/// <reference path='../typings/tsd.d.ts' />;

import View from './view';

const sulas = window['sulas'];
const slog =  window['slog'];

/**
 * View
 */
class SmsView extends View
{
    private static CLS_NAME = 'SmsView';

    private smsCodeTextBox;
    private sendButton;

    /**
     * 初期化
     */
    protected init(isResize : boolean) : void
    {
        const log = slog.stepIn(SmsView.CLS_NAME, 'init');

        const $smsCodeTextBox = $('#sms-code');

        this.smsCodeTextBox = new sulas.TextBox($smsCodeTextBox, $smsCodeTextBox.width(), 30, 'ログインコード', 'text');
        this.sendButton =     new sulas.Button('#send', 0, 50, '送信する');

        this.sendButton.on('click', this.onClickSendButton.bind(this));
        log.stepOut();
    }

    /**
     * @method  onClickSendButton
     */
    private onClickSendButton() : void
    {
        const log = slog.stepIn(SmsView.CLS_NAME, 'onClickSendButton');

        const smsId = $('#sms-id').val();
        const smsCode = this.smsCodeTextBox.getValue();

        $.ajax({
            type: 'POST',
            url: '/api/login/sms',
            data: {smsId, smsCode}
        })

        .done((data, status, jqXHR) =>
        {
            const log = slog.stepIn(SmsView.CLS_NAME, 'change.done');

            if (data.status === 0)
            {
                location.href = '/';
            }
            else
            {
                $('#message').text(data.message);
            }

            log.stepOut();
        })

        .fail((jqXHR, status, error) =>
        {
            const log = slog.stepIn(SmsView.CLS_NAME, 'change.fail');
            log.stepOut();
        });

        log.stepOut();
    }
}

window.addEventListener('load', () => new SmsView(), false);
