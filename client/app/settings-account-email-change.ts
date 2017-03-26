/**
 * (C) 2016-2017 printf.jp
 */
import View from './view';
import Api  from '../utils/api';
import R    from '../utils/r';

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
    private async onClickChangeButton()
    {
        const log = slog.stepIn(SettingsAccountEmailChangeView.CLS_NAME, 'onClickChangeButton');
        try
        {
            const changeId = $('#change-id').val();
            const password = this.passwordTextBox.getValue();

            const message = await Api.confirmChangeEmail(changeId, password);
            $('#message').text(message);
            log.stepOut();
        }
        catch (err) {log.stepOut()}
    }
}

window.addEventListener('load', () => new SettingsAccountEmailChangeView(), false);
