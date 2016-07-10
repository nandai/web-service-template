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
class SettingsAccountEmailChangeView extends View
{
    private static CLS_NAME = 'SettingsAccountEmailChangeView';

    private passwordTextBox;
    private changeButton;

    /**
     * 初期化
     */
    protected init(isResize : boolean) : void
    {
        const log = slog.stepIn(SettingsAccountEmailChangeView.CLS_NAME, 'init');

        const $passwordTextBox = $('#password');

        this.passwordTextBox = new sulas.TextBox($passwordTextBox, $passwordTextBox.width(), 30, 'パスワード', 'password');
        this.changeButton =    new sulas.Button('#change', 0, 50, '送信する');

        this.changeButton.on('click', this.onClickChangeButton.bind(this));

        log.stepOut();
    }

    /**
     * @method  onClickChangeButton
     */
    private onClickChangeButton() : void
    {
        const log = slog.stepIn(SettingsAccountEmailChangeView.CLS_NAME, 'onClickChangeButton');
        const data =
        {
            change_id: $('#change-id').val(),
            password: this.passwordTextBox.getValue()
        };

        $.ajax({
            type: 'PUT',
            url: `/api/settings/account/email/change`,
            data: data
        })

        .done((data, status, jqXHR) =>
        {
            const log = slog.stepIn(SettingsAccountEmailChangeView.CLS_NAME, 'settings-account-email-change.done');

            if (data.status === 0)
            {
                location.href = data.redirect;
            }
            else
            {
                $('#message').text(data.message);
            }

            log.stepOut();
        })

        .fail((jqXHR, status, error) =>
        {
            const log = slog.stepIn(SettingsAccountEmailChangeView.CLS_NAME, 'settings-account-email-change.fail');
            log.stepOut();
        });

        log.stepOut();
    }
}

window.addEventListener('load', () => new SettingsAccountEmailChangeView(), false);
