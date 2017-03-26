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
class SettingsAccountView extends View
{
    private static CLS_NAME = 'SettingsAccountView';

    private nameTextBox;
    private phoneNoTextBox;
    private changeButton;

    /**
     * 初期化
     */
    protected async init(isResize : boolean)
    {
        const log = slog.stepIn(SettingsAccountView.CLS_NAME, 'init');

        const $nameTextBox =    $('#name');
        const $phoneNoTextBox = $('#phone-no');

        this.nameTextBox =    new sulas.TextBox($nameTextBox,    $nameTextBox.width(),    30, R.text(R.ACCOUNT_NAME), 'text');
        this.phoneNoTextBox = new sulas.TextBox($phoneNoTextBox, $phoneNoTextBox.width(), 30, R.text(R.TEL),          'text');
        this.changeButton =   new sulas.Button('#change', 0, 50, R.text(R.CHANGE));

        this.changeButton.on('click', this.onClickChangeButton.bind(this));

        try
        {
            const account = await Api.getAccount();
            this.nameTextBox.   setValue(account.name);
            this.phoneNoTextBox.setValue(account.phoneNo);
            log.stepOut();
        }
        catch (err) {log.stepOut()}
    }

    /**
     * @method  onClickChangeButton
     */
    private async onClickChangeButton()
    {
        const log = slog.stepIn(SettingsAccountView.CLS_NAME, 'onClickChangeButton');
        try
        {
            const name =    this.nameTextBox.   getValue();
            const phoneNo = this.phoneNoTextBox.getValue();

            const message = await Api.setAccount(name, phoneNo);
            $('#message').text(message);
            log.stepOut();
        }
        catch (err) {log.stepOut()}
    }
}

window.addEventListener('load', () => new SettingsAccountView(), false);
