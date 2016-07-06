/**
 * (C) 2016 printf.jp
 */
/// <reference path='../typings/tsd.d.ts' />;
var sulas;
var slog;
/**
 * View
 */
var SettingsAccountEmailChangeView = (function () {
    /**
     * @constructor
     */
    function SettingsAccountEmailChangeView() {
        var log = slog.stepIn(SettingsAccountEmailChangeView.CLS_NAME, 'constructor');
        var $passwordTextBox = $('#password');
        this.passwordTextBox = new sulas.TextBox($passwordTextBox, $passwordTextBox.width(), 30, 'パスワード', 'password');
        this.changeButton = new sulas.Button('#change', 0, 50, '送信する');
        this.changeButton.on('click', this.onClickChangeButton.bind(this));
        log.stepOut();
    }
    /**
     * @method  onClickChangeButton
     */
    SettingsAccountEmailChangeView.prototype.onClickChangeButton = function () {
        var log = slog.stepIn(SettingsAccountEmailChangeView.CLS_NAME, 'onClickChangeButton');
        var data = {
            change_id: $('#change-id').val(),
            password: this.passwordTextBox.getValue()
        };
        $.ajax({
            type: 'PUT',
            url: "/api/settings/account/email/change",
            data: data
        })
            .done(function (data, status, jqXHR) {
            var log = slog.stepIn(SettingsAccountEmailChangeView.CLS_NAME, 'settings-account-email-change.done');
            if (data.status === 0) {
                location.href = data.redirect;
            }
            else {
                $('#message').text(data.message);
            }
            log.stepOut();
        })
            .fail(function (jqXHR, status, error) {
            var log = slog.stepIn(SettingsAccountEmailChangeView.CLS_NAME, 'settings-account-email-change.fail');
            log.stepOut();
        });
        log.stepOut();
    };
    SettingsAccountEmailChangeView.CLS_NAME = 'SettingsAccountEmailChangeView';
    return SettingsAccountEmailChangeView;
}());
/**
 * onLoad
 */
window.addEventListener('load', function () {
    var view = new SettingsAccountEmailChangeView();
}, false);
