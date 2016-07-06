/**
 * (C) 2016 printf.jp
 */
/// <reference path='../typings/tsd.d.ts' />;
var sulas;
var slog;
/**
 * View
 */
var ResetView = (function () {
    /**
     * @constructor
     */
    function ResetView() {
        var log = slog.stepIn(ResetView.CLS_NAME, 'constructor');
        var $passwordTextBox = $('#password');
        var $confirmTextBox = $('#confirm');
        this.passwordTextBox = new sulas.TextBox($passwordTextBox, $passwordTextBox.width(), 30, 'パスワード', 'password');
        this.confirmTextBox = new sulas.TextBox($confirmTextBox, $confirmTextBox.width(), 30, 'パスワードの確認', 'password');
        this.changeButton = new sulas.Button('#change', 0, 50, '変更する');
        this.changeButton.on('click', this.onClickChangeButton.bind(this));
        log.stepOut();
    }
    /**
     * @method  onClickChangeButton
     */
    ResetView.prototype.onClickChangeButton = function () {
        var log = slog.stepIn(ResetView.CLS_NAME, 'onClickChangeButton');
        var id = $('#reset-id').val();
        var password = this.passwordTextBox.getValue();
        var confirm = this.confirmTextBox.getValue();
        $.ajax({
            type: 'PUT',
            url: '/api/reset/change',
            data: { id: id, password: password, confirm: confirm }
        })
            .done(function (data, status, jqXHR) {
            var log = slog.stepIn(ResetView.CLS_NAME, 'change.done');
            $('#message').text(data.message);
            log.stepOut();
        })
            .fail(function (jqXHR, status, error) {
            var log = slog.stepIn(ResetView.CLS_NAME, 'change.fail');
            log.stepOut();
        });
        log.stepOut();
    };
    ResetView.CLS_NAME = 'ResetView';
    return ResetView;
}());
/**
 * onLoad
 */
window.addEventListener('load', function () {
    var view = new ResetView();
}, false);
