/**
 * (C) 2016 printf.jp
 */
/// <reference path='../typings/tsd.d.ts' />;
var sulas;
var slog;
/**
 * View
 */
var TopView = (function () {
    /**
     * @constructor
     */
    function TopView() {
        this.settingsButton = new sulas.Button('#settings', 0, 50, '設定画面へ');
        this.logoutButton = new sulas.Button('#logout', 0, 50, 'ログアウト');
        var log = slog.stepIn(TopView.CLS_NAME, 'constructor');
        this.settingsButton.on('click', this.onClickSettingsButton.bind(this));
        this.logoutButton.on('click', this.onClickLogoutButton.bind(this));
        log.stepOut();
    }
    /**
     * @method  onClickSettingsButton
     */
    TopView.prototype.onClickSettingsButton = function () {
        var log = slog.stepIn(TopView.CLS_NAME, 'onClickSettingsButton');
        window.location.href = '/settings';
        log.stepOut();
    };
    /**
     * @method  onClickLogoutButton
     */
    TopView.prototype.onClickLogoutButton = function () {
        var log = slog.stepIn(TopView.CLS_NAME, 'onClickLogoutButton');
        $.ajax({
            type: 'POST',
            url: "/api/logout"
        })
            .done(function (data, status, jqXHR) {
            var log = slog.stepIn(TopView.CLS_NAME, 'logout.done');
            location.href = '/';
            log.stepOut();
        })
            .fail(function (jqXHR, status, error) {
            var log = slog.stepIn(TopView.CLS_NAME, 'logout.fail');
            log.stepOut();
        });
        log.stepOut();
    };
    TopView.CLS_NAME = 'TopView';
    return TopView;
}());
/**
 * onLoad
 */
window.addEventListener('load', function () {
    var view = new TopView();
}, false);
if (window.location.hash === '#_=_') {
    // facebookのコールバックでなぜかゴミが付いてくるので取り除く
    //  window.location.hash = '';
    window.history.pushState('', document.title, window.location.pathname);
}
