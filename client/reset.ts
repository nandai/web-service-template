/**
 * (C) 2016 printf.jp
 */

/// <reference path='../typings/tsd.d.ts' />;

var sulas;
var slog;

/**
 * View
 */
class ResetView
{
    private static CLS_NAME = 'ResetView';

    private passwordTextBox;
    private confirmTextBox;
    private changeButton;

    /**
     * @constructor
     */
    constructor()
    {
        const log = slog.stepIn(ResetView.CLS_NAME, 'constructor');

        const $passwordTextBox = $('#password');
        const $confirmTextBox =  $('#confirm');

        this.passwordTextBox = new sulas.TextBox($passwordTextBox, $passwordTextBox.width(), 30, 'パスワード',       'password');
        this.confirmTextBox =  new sulas.TextBox($confirmTextBox,  $confirmTextBox. width(), 30, 'パスワードの確認', 'password');
        this.changeButton =    new sulas.Button('#change',   0, 50, '変更する');

        this.changeButton.on('click', this.onClickChangeButton.  bind(this));
        log.stepOut();
    }

    /**
     * @method  onClickChangeButton
     */
    private onClickChangeButton() : void
    {
        const log = slog.stepIn(ResetView.CLS_NAME, 'onClickChangeButton');

        const id = $('#reset-id').val();
        const password = this.passwordTextBox.getValue();
        const confirm =  this.confirmTextBox. getValue();

        $.ajax({
            type: 'PUT',
            url: '/api/reset/change',
            data: {id, password, confirm}
        })

        .done((data, status, jqXHR) =>
        {
            const log = slog.stepIn(ResetView.CLS_NAME, 'change.done');
            $('#message').text(data.message);
            log.stepOut();
        })

        .fail((jqXHR, status, error) =>
        {
            const log = slog.stepIn(ResetView.CLS_NAME, 'change.fail');
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
    const view = new ResetView();
}, false);
