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
class SmsView extends View
{
    private static CLS_NAME = 'SmsView';

    private smsCodeTextBox;
    private sendButton;

    /**
     * 初期化
     */
    protected init(isResize : boolean) : void
    {
        const log = slog.stepIn(SmsView.CLS_NAME, 'init');

        const $smsCodeTextBox = $('#sms-code');

        this.smsCodeTextBox = new sulas.TextBox($smsCodeTextBox, $smsCodeTextBox.width(), 30, R.text(R.LOGIN_CODE), 'text');
        this.sendButton =     new sulas.Button('#send', 0, 50, R.text(R.SEND));

        this.sendButton.on('click', this.onClickSendButton.bind(this));
        log.stepOut();
    }

    /**
     * @method  onClickSendButton
     */
    private async onClickSendButton()
    {
        const log = slog.stepIn(SmsView.CLS_NAME, 'onClickSendButton');

        const smsId = $('#sms-id').val();
        const smsCode = this.smsCodeTextBox.getValue();

        try
        {
            const message = await Api.smsLogin(smsId, smsCode);

            if (message === null)
            {
                location.href = '/';
            }
            else
            {
                $('#message').text(message);
            }

            log.stepOut();
        }
        catch (err) {log.stepOut()}
    }
}

window.addEventListener('load', () => new SmsView(), false);
