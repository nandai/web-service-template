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
class SettingsAccountView extends View
{
    private static CLS_NAME = 'SettingsAccountView';

    private nameTextBox;
    private phoneNoTextBox;
    private changeButton;

    /**
     * 初期化
     */
    protected init(isResize : boolean) : void
    {
        const log = slog.stepIn(SettingsAccountView.CLS_NAME, 'init');

        const $nameTextBox =    $('#name');
        const $phoneNoTextBox = $('#phone-no');

        this.nameTextBox =    new sulas.TextBox($nameTextBox,    $nameTextBox.width(),    30, R.text(R.ACCOUNT_NAME), 'text');
        this.phoneNoTextBox = new sulas.TextBox($phoneNoTextBox, $phoneNoTextBox.width(), 30, R.text(R.TEL),          'text');
        this.changeButton =   new sulas.Button('#change', 0, 50, R.text(R.CHANGE));

        this.changeButton.on('click', this.onClickChangeButton.bind(this));

        $.ajax({
            type: 'GET',
            url: `/api/settings/account`
        })

        .done((data, status, jqXHR) =>
        {
            const account = data;
            this.nameTextBox.   setValue(account.name);
            this.phoneNoTextBox.setValue(account.phoneNo);
        })

        .fail((jqXHR, status, error) =>
        {
        });

        log.stepOut();
    }

    /**
     * @method  onClickChangeButton
     */
    private onClickChangeButton() : void
    {
        const log = slog.stepIn(SettingsAccountView.CLS_NAME, 'onClickChangeButton');

        const name =    this.nameTextBox.   getValue();
        const phoneNo = this.phoneNoTextBox.getValue();

        $.ajax({
            type: 'PUT',
            url: '/api/settings/account',
            data: {name, phoneNo}
        })

        .done((data, status, jqXHR) =>
        {
            const log = slog.stepIn(SettingsAccountView.CLS_NAME, 'settings-account.done');
            $('#message').text(data.message);
            log.stepOut();
        })

        .fail((jqXHR, status, error) =>
        {
            const log = slog.stepIn(SettingsAccountView.CLS_NAME, 'settings-account.fail');
            log.stepOut();
        });

        log.stepOut();
    }
}

window.addEventListener('load', () => new SettingsAccountView(), false);
