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
class SettingsAccountEmailView extends View
{
    private static CLS_NAME = 'SettingsAccountEmailView';

    private emailTextBox;
    private sendMailButton;

    /**
     * 初期化
     */
    protected init(isResize : boolean) : void
    {
        const log = slog.stepIn(SettingsAccountEmailView.CLS_NAME, 'init');

        const $emailTextBox = $('#email');

        this.emailTextBox =   new sulas.TextBox($emailTextBox, $emailTextBox.width(), 30, 'メールアドレス', 'email');
        this.sendMailButton = new sulas.Button('#sendMail', 0, 50, '変更する');

        this.sendMailButton.on('click', this.onClickSendMailButton.bind(this));

        $.ajax({
            type: 'GET',
            url: `/api/settings/account`
        })

        .done((data, status, jqXHR) =>
        {
            const account = data;
            this.emailTextBox.setValue(account.email);
        })

        .fail((jqXHR, status, error) =>
        {
        });

        log.stepOut();
    }

    /**
     * @method  onClickSendMailButton
     */
    private onClickSendMailButton() : void
    {
        const log = slog.stepIn(SettingsAccountEmailView.CLS_NAME, 'onClickSendMailButton');

        $.ajax({
            type: 'PUT',
            url: '/api/settings/account/email',
            data: {email:this.emailTextBox.getValue()}
        })

        .done((data, status, jqXHR) =>
        {
            const log = slog.stepIn(SettingsAccountEmailView.CLS_NAME, 'settings-account-email.done');
            $('#message').text(data.message);
            log.stepOut();
        })

        .fail((jqXHR, status, error) =>
        {
            const log = slog.stepIn(SettingsAccountEmailView.CLS_NAME, 'settings-account-email.fail');
            log.stepOut();
        });

        log.stepOut();
    }
}

window.addEventListener('load', () => new SettingsAccountEmailView(), false);
