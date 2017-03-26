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
class ResetView extends View
{
    private static CLS_NAME = 'ResetView';

    private passwordTextBox;
    private confirmTextBox;
    private changeButton;

    /**
     * 初期化
     */
    protected init(isResize : boolean) : void
    {
        const log = slog.stepIn(ResetView.CLS_NAME, 'init');

        const $passwordTextBox = $('#password');
        const $confirmTextBox =  $('#confirm');

        this.passwordTextBox = new sulas.TextBox($passwordTextBox, $passwordTextBox.width(), 30, R.text(R.PASSWORD),           'password');
        this.confirmTextBox =  new sulas.TextBox($confirmTextBox,  $confirmTextBox. width(), 30, R.text(R.NEW_PASSWORD_AGAIN), 'password');
        this.changeButton =    new sulas.Button('#change',   0, 50, R.text(R.CHANGE));

        this.changeButton.on('click', this.onClickChangeButton.  bind(this));
        log.stepOut();
    }

    /**
     * @method  onClickChangeButton
     */
    private async onClickChangeButton()
    {
        const log = slog.stepIn(ResetView.CLS_NAME, 'onClickChangeButton');
        try
        {
            const resetId = $('#reset-id').val();
            const password = this.passwordTextBox.getValue();
            const confirm =  this.confirmTextBox. getValue();

            const message = await Api.resetPassword(resetId, password, confirm);
            $('#message').text(message);
            log.stepOut();
        }
        catch (err) {log.stepOut()}
    }
}

window.addEventListener('load', () => new ResetView(), false);
