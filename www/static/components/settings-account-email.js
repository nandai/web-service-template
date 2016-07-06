/**
 * (C) 2016 printf.jp
 */
/// <reference path='../typings/tsd.d.ts' />;
var sulas;
var slog;
/**
 * View
 */
var SettingsAccountEmailView = (function () {
    /**
     * @constructor
     */
    function SettingsAccountEmailView() {
        var log = slog.stepIn(SettingsAccountEmailView.CLS_NAME, 'constructor');
        var $emailTextBox = $('#email');
        this.emailTextBox = new sulas.TextBox($emailTextBox, $emailTextBox.width(), 30, 'メールアドレス', 'text');
        this.sendMailButton = new sulas.Button('#sendMail', 0, 50, '変更する');
        this.sendMailButton.on('click', this.onClickSendMailButton.bind(this));
        log.stepOut();
    }
    /**
     * @method  onClickSendMailButton
     */
    SettingsAccountEmailView.prototype.onClickSendMailButton = function () {
        var log = slog.stepIn(SettingsAccountEmailView.CLS_NAME, 'onClickSendMailButton');
        $.ajax({
            type: 'PUT',
            url: '/api/settings/account/email',
            data: { email: this.emailTextBox.getValue() }
        })
            .done(function (data, status, jqXHR) {
            var log = slog.stepIn(SettingsAccountEmailView.CLS_NAME, 'settings-account-email.done');
            $('#message').text(data.message);
            log.stepOut();
        })
            .fail(function (jqXHR, status, error) {
            var log = slog.stepIn(SettingsAccountEmailView.CLS_NAME, 'settings-account-email.fail');
            log.stepOut();
        });
        log.stepOut();
    };
    SettingsAccountEmailView.CLS_NAME = 'SettingsAccountEmailView';
    return SettingsAccountEmailView;
}());
/**
 * onLoad
 */
window.addEventListener('load', function () {
    var view = new SettingsAccountEmailView();
}, false);
