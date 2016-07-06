/**
 * (C) 2016 printf.jp
 */

/// <reference path='../typings/tsd.d.ts' />;

var sulas;
var slog;

/**
 * View
 */
class SignupConfirmView
{
    private static CLS_NAME = 'SignupConfirmView';

    private passwordTextBox;
    private confirmButton;

    /**
     * @constructor
     */
    constructor()
    {
        const log = slog.stepIn(SignupConfirmView.CLS_NAME, 'constructor');

        const $passwordTextBox = $('#password');

        this.passwordTextBox = new sulas.TextBox($passwordTextBox, $passwordTextBox.width(), 30, 'パスワード', 'password');
        this.confirmButton =    new sulas.Button('#confirm', 0, 50, '送信する');

        this.confirmButton.on('click', this.onClickConfirmButton.bind(this));

        log.stepOut();
    }

    /**
     * @method  onClickConfirmButton
     */
    private onClickConfirmButton() : void
    {
        const log = slog.stepIn(SignupConfirmView.CLS_NAME, 'onClickConfirmButton');
        const data =
        {
            signup_id: $('#signup-id').val(),
            password: this.passwordTextBox.getValue()
        };

        $.ajax({
            type: 'POST',
            url: `/api/signup/email/confirm`,
            data: data
        })

        .done((data, status, jqXHR) =>
        {
            const log = slog.stepIn(SignupConfirmView.CLS_NAME, 'signup-confirm.done');

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
            const log = slog.stepIn(SignupConfirmView.CLS_NAME, 'signup-confirm.fail');
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
    const view = new SignupConfirmView();
}, false);
