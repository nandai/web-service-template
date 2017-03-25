/**
 * (C) 2016-2017 printf.jp
 */
import View from './view';
import R    from './utils/r';

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

        this.oldPasswordTextBox = new sulas.TextBox($oldPasswordTextBox, $oldPasswordTextBox.width(), 30, R.text(R.CURRENT_PASSWORD),   'password');
        this.newPasswordTextBox = new sulas.TextBox($newPasswordTextBox, $newPasswordTextBox.width(), 30, R.text(R.NEW_PASSWORD),       'password');
        this.confirmTextBox =     new sulas.TextBox($confirmTextBox,     $confirmTextBox.    width(), 30, R.text(R.NEW_PASSWORD_AGAIN), 'password');
        this.changeButton =       new sulas.Button('#change',   0, 50, R.text(R.CHANGE));

        this.changeButton.on('click', this.onClickChangeButton.  bind(this));
        log.stepOut();
    }

    /**
     * @method  onClickChangeButton
     */
    private onClickChangeButton() : void
    {
        const log = slog.stepIn(SettingsAccountPasswordView.CLS_NAME, 'onClickChangeButton');

        const oldPassword = this.oldPasswordTextBox.getValue();
        const newPassword = this.newPasswordTextBox.getValue();
        const confirm =     this.confirmTextBox.    getValue();

        $.ajax({
            type: 'PUT',
            url: '/api/settings/account/password',
            data: {oldPassword, newPassword, confirm}
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
