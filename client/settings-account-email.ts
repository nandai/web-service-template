/**
 * (C) 2016 printf.jp
 */

/// <reference path='../typings/tsd.d.ts' />;

var sulas;
var slog;

/**
 * View
 */
class SettingsAccountEmailView
{
    private static CLS_NAME = 'SettingsAccountEmailView';

    private emailTextBox;
    private sendMailButton;

    /**
     * @constructor
     */
    constructor()
    {
        const log = slog.stepIn(SettingsAccountEmailView.CLS_NAME, 'constructor');

        const $emailTextBox = $('#email');

        this.emailTextBox =   new sulas.TextBox($emailTextBox, $emailTextBox.width(), 30, 'メールアドレス', 'text');
        this.sendMailButton = new sulas.Button('#sendMail', 0, 50, '変更する');

        this.sendMailButton.on('click', this.onClickSendMailButton.bind(this));

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

/**
 * onLoad
 */
window.addEventListener('load', () =>
{
    const view = new SettingsAccountEmailView();
}, false);
