/**
 * (C) 2016 printf.jp
 */
import View from './view';
import R    from './r';

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
    private onClickSendMailButton() : void
    {
        const log = slog.stepIn(ForgetView.CLS_NAME, 'onClickSendMailButton');

        $.ajax({
            type: 'POST',
            url: '/api/reset',
            data: {email:this.emailTextBox.getValue()}
        })

        .done((data, status, jqXHR) =>
        {
            const log = slog.stepIn(ForgetView.CLS_NAME, 'reset.done');
            $('#message').text(data.message);
            log.stepOut();
        })

        .fail((jqXHR, status, error) =>
        {
            const log = slog.stepIn(ForgetView.CLS_NAME, 'reset.fail');
            log.stepOut();
        });

        log.stepOut();
    }
}

window.addEventListener('load', () => new ForgetView(), false);
