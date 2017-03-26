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
class SettingsAccountEmailView extends View
{
    private static CLS_NAME = 'SettingsAccountEmailView';

    private emailTextBox;
    private sendMailButton;

    /**
     * 初期化
     */
    protected async init(isResize : boolean)
    {
        const log = slog.stepIn(SettingsAccountEmailView.CLS_NAME, 'init');
        const $emailTextBox = $('#email');

        this.emailTextBox =   new sulas.TextBox($emailTextBox, $emailTextBox.width(), 30, R.text(R.EMAIL), 'email');
        this.sendMailButton = new sulas.Button('#sendMail', 0, 50, R.text(R.CHANGE));

        this.sendMailButton.on('click', this.onClickSendMailButton.bind(this));

        try
        {
            const account = await Api.getAccount();
            this.emailTextBox.setValue(account.email);
            log.stepOut();
        }
        catch (err) {log.stepOut()}
    }

    /**
     * @method  onClickSendMailButton
     */
    private async onClickSendMailButton()
    {
        const log = slog.stepIn(SettingsAccountEmailView.CLS_NAME, 'onClickSendMailButton');
        try
        {
            const email = this.emailTextBox.getValue();
            const message = await Api.changeEmail(email);
            $('#message').text(message);
            log.stepOut();
        }
        catch (err) {log.stepOut()}
    }
}

window.addEventListener('load', () => new SettingsAccountEmailView(), false);
