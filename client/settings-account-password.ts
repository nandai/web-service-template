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
class SettingsAccountPasswordView extends View
{
    private static CLS_NAME = 'SettingsAccountPasswordView';

    private oldPasswordTextBox;
    private newPasswordTextBox;
    private confirmTextBox;
    private changeButton;

    /**
     * 初期化
     */
    protected init(isResize : boolean) : void
    {
        const log = slog.stepIn(SettingsAccountPasswordView.CLS_NAME, 'init');

        const $oldPasswordTextBox = $('#old-password');
        const $newPasswordTextBox = $('#new-password');
        const $confirmTextBox =     $('#confirm');

        this.oldPasswordTextBox = new sulas.TextBox($oldPasswordTextBox, $oldPasswordTextBox.width(), 30, '現在のパスワード', 'password');
        this.newPasswordTextBox = new sulas.TextBox($newPasswordTextBox, $newPasswordTextBox.width(), 30, '新しいパスワード', 'password');
        this.confirmTextBox =     new sulas.TextBox($confirmTextBox,     $confirmTextBox.    width(), 30, 'パスワードの確認', 'password');
        this.changeButton =       new sulas.Button('#change',   0, 50, '変更する');

        this.changeButton.on('click', this.onClickChangeButton.  bind(this));
        log.stepOut();
    }

    /**
     * @method  onClickChangeButton
     */
    private onClickChangeButton() : void
    {
        const log = slog.stepIn(SettingsAccountPasswordView.CLS_NAME, 'onClickChangeButton');

        const old_password = this.oldPasswordTextBox.getValue();
        const new_password = this.newPasswordTextBox.getValue();
        const confirm =      this.confirmTextBox.    getValue();

        $.ajax({
            type: 'PUT',
            url: '/api/settings/account/password',
            data: {old_password, new_password, confirm}
        })

        .done((data, status, jqXHR) =>
        {
            const log = slog.stepIn(SettingsAccountPasswordView.CLS_NAME, 'change.done');
            $('#message').text(data.message);
            log.stepOut();
        })

        .fail((jqXHR, status, error) =>
        {
            const log = slog.stepIn(SettingsAccountPasswordView.CLS_NAME, 'change.fail');
            log.stepOut();
        });

        log.stepOut();
    }
}

window.addEventListener('load', () => new SettingsAccountPasswordView(), false);
