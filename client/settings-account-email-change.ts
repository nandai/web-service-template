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

        this.passwordTextBox = new sulas.TextBox($passwordTextBox, $passwordTextBox.width(), 30, R.text(R.PASSWORD), 'password');
        this.changeButton =    new sulas.Button('#change', 0, 50, R.text(R.SEND));

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
            changeId: $('#change-id').val(),
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
            $('#message').text(data.message);
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
