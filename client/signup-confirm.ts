/**
 * (C) 2016 printf.jp
 */

/// <reference path='../typings/tsd.d.ts' />;

import View from './view';
import R    from './r';

const sulas = window['sulas'];
const slog =  window['slog'];

/**
 * View
 */
class SignupConfirmView extends View
{
    private static CLS_NAME = 'SignupConfirmView';

    private passwordTextBox;
    private confirmButton;

    /**
     * 初期化
     */
    protected init(isResize : boolean) : void
    {
        const log = slog.stepIn(SignupConfirmView.CLS_NAME, 'init');

        const $passwordTextBox = $('#password');

        this.passwordTextBox = new sulas.TextBox($passwordTextBox, $passwordTextBox.width(), 30, R.text(R.PASSWORD), 'password');
        this.confirmButton =    new sulas.Button('#confirm', 0, 50, R.text(R.SEND));

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
            signupId: $('#signup-id').val(),
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

window.addEventListener('load', () => new SignupConfirmView(), false);
