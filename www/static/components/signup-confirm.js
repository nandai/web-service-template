/**
 * (C) 2016 printf.jp
 */
/// <reference path='../typings/tsd.d.ts' />;
var sulas;
var slog;
/**
 * View
 */
var SignupConfirmView = (function () {
    /**
     * @constructor
     */
    function SignupConfirmView() {
        var log = slog.stepIn(SignupConfirmView.CLS_NAME, 'constructor');
        var $passwordTextBox = $('#password');
        this.passwordTextBox = new sulas.TextBox($passwordTextBox, $passwordTextBox.width(), 30, 'パスワード', 'password');
        this.confirmButton = new sulas.Button('#confirm', 0, 50, '送信する');
        this.confirmButton.on('click', this.onClickConfirmButton.bind(this));
        log.stepOut();
    }
    /**
     * @method  onClickConfirmButton
     */
    SignupConfirmView.prototype.onClickConfirmButton = function () {
        var log = slog.stepIn(SignupConfirmView.CLS_NAME, 'onClickConfirmButton');
        var data = {
            signup_id: $('#signup-id').val(),
            password: this.passwordTextBox.getValue()
        };
        $.ajax({
            type: 'POST',
            url: "/api/signup/email/confirm",
            data: data
        })
            .done(function (data, status, jqXHR) {
            var log = slog.stepIn(SignupConfirmView.CLS_NAME, 'signup-confirm.done');
            if (data.status === 0) {
                location.href = data.redirect;
            }
            else {
                $('#message').text(data.message);
            }
            log.stepOut();
        })
            .fail(function (jqXHR, status, error) {
            var log = slog.stepIn(SignupConfirmView.CLS_NAME, 'signup-confirm.fail');
            log.stepOut();
        });
        log.stepOut();
    };
    SignupConfirmView.CLS_NAME = 'SignupConfirmView';
    return SignupConfirmView;
}());
/**
 * onLoad
 */
window.addEventListener('load', function () {
    var view = new SignupConfirmView();
}, false);
