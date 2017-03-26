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
class ForgetView extends View
{
    private static CLS_NAME = 'ForgetView';

    private emailTextBox;
    private sendMailButton;

    /**
     * 初期化
     */
    protected init(isResize : boolean) : void
    {
        const log = slog.stepIn(ForgetView.CLS_NAME, 'init');

        const $emailTextBox = $('#email');

        this.emailTextBox =   new sulas.TextBox($emailTextBox, $emailTextBox.width(), 30, R.text(R.EMAIL), 'email');
        this.sendMailButton = new sulas.Button('#sendMail', 0, 50, R.text(R.SEND_MAIL));

        this.sendMailButton.on('click', this.onClickSendMailButton.bind(this));

        log.stepOut();
    }

    /**
     * @method  onClickSendMailButton
     */
    private async onClickSendMailButton()
    {
        const log = slog.stepIn(ForgetView.CLS_NAME, 'onClickSendMailButton');
        try
        {
            const email = this.emailTextBox.getValue();
            const message = await Api.requestResetPassword(email);
            $('#message').text(message);
            log.stepOut();
        }
        catch (err) {log.stepOut()}
    }
}

window.addEventListener('load', () => new ForgetView(), false);
