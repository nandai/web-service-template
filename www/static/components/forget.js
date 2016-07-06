/**
 * (C) 2016 printf.jp
 */
/// <reference path='../typings/tsd.d.ts' />;
var sulas;
var slog;
/**
 * View
 */
var ForgetView = (function () {
    /**
     * @constructor
     */
    function ForgetView() {
        var log = slog.stepIn(ForgetView.CLS_NAME, 'constructor');
        var $emailTextBox = $('#email');
        this.emailTextBox = new sulas.TextBox($emailTextBox, $emailTextBox.width(), 30, 'メールアドレス', 'text');
        this.sendMailButton = new sulas.Button('#sendMail', 0, 50, 'メールを送信する');
        this.sendMailButton.on('click', this.onClickSendMailButton.bind(this));
        log.stepOut();
    }
    /**
     * @method  onClickSendMailButton
     */
    ForgetView.prototype.onClickSendMailButton = function () {
        var log = slog.stepIn(ForgetView.CLS_NAME, 'onClickSendMailButton');
        $.ajax({
            type: 'POST',
            url: '/api/reset',
            data: { email: this.emailTextBox.getValue() }
        })
            .done(function (data, status, jqXHR) {
            var log = slog.stepIn(ForgetView.CLS_NAME, 'reset.done');
            $('#message').text(data.message);
            log.stepOut();
        })
            .fail(function (jqXHR, status, error) {
            var log = slog.stepIn(ForgetView.CLS_NAME, 'reset.fail');
            log.stepOut();
        });
        log.stepOut();
    };
    ForgetView.CLS_NAME = 'ForgetView';
    return ForgetView;
}());
/**
 * onLoad
 */
window.addEventListener('load', function () {
    var view = new ForgetView();
}, false);
