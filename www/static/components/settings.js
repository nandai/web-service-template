/**
 * (C) 2016 printf.jp
 */
/// <reference path='../typings/tsd.d.ts' />;
var sulas;
var slog;
/**
 * View
 */
var SettingsView = (function () {
    /**
     * @constructor
     */
    function SettingsView() {
        var _this = this;
        this.twitterButton = new sulas.Button('#twitter', 0, 50, 'twitterを紐づける');
        this.facebookButton = new sulas.Button('#facebook', 0, 50, 'facebookを紐づける');
        this.googleButton = new sulas.Button('#google', 0, 50, 'googleを紐づける');
        this.emailButton = new sulas.Button('#email', 0, 50, 'メールアドレスを設定する');
        this.passwordButton = new sulas.Button('#password', 0, 50, 'パスワードを設定する');
        this.leaveButton = new sulas.Button('#leave', 0, 50, '退会する');
        this.backButton = new sulas.Button('#back', 0, 50, '戻る');
        var log = slog.stepIn(SettingsView.CLS_NAME, 'constructor');
        $.ajax({
            type: 'GET',
            url: "/api/settings/account"
        })
            .done(function (data, status, jqXHR) {
            _this.account = data;
            $('#name').text(_this.account.name);
            if (_this.account.twitter)
                _this.twitterButton.setLabel('twitterとの紐づけを解除する');
            if (_this.account.facebook)
                _this.facebookButton.setLabel('facebookとの紐づけを解除する');
            if (_this.account.google)
                _this.googleButton.setLabel('googleとの紐づけを解除する');
        })
            .fail(function (jqXHR, status, error) {
        });
        this.twitterButton.on('click', this.onClickTwitterButton.bind(this));
        this.facebookButton.on('click', this.onClickFacebookButton.bind(this));
        this.googleButton.on('click', this.onClickGoogleButton.bind(this));
        this.emailButton.on('click', this.onClickEmailButton.bind(this));
        this.passwordButton.on('click', this.onClickPasswordButton.bind(this));
        this.leaveButton.on('click', this.onClickLeaveButton.bind(this));
        this.backButton.on('click', this.onClickBackButton.bind(this));
        log.stepOut();
    }
    /**
     * @method  onClickTwitterButton
     */
    SettingsView.prototype.onClickTwitterButton = function () {
        var log = slog.stepIn(SettingsView.CLS_NAME, 'onClickTwitterButton');
        this.link('twitter');
        log.stepOut();
    };
    /**
     * @method  onClickFacebookButton
     */
    SettingsView.prototype.onClickFacebookButton = function () {
        var log = slog.stepIn(SettingsView.CLS_NAME, 'onClickFacebookButton');
        this.link('facebook');
        log.stepOut();
    };
    /**
     * @method  onClickGoogleButton
     */
    SettingsView.prototype.onClickGoogleButton = function () {
        var log = slog.stepIn(SettingsView.CLS_NAME, 'onClickGoogleButton');
        this.link('google');
        log.stepOut();
    };
    /**
     * @method  onClickEmailButton
     */
    SettingsView.prototype.onClickEmailButton = function () {
        var log = slog.stepIn(SettingsView.CLS_NAME, 'onClickEmailButton');
        window.location.href = '/settings/account/email';
        log.stepOut();
    };
    /**
     * @method  onClickPasswordButton
     */
    SettingsView.prototype.onClickPasswordButton = function () {
        var log = slog.stepIn(SettingsView.CLS_NAME, 'onClickPasswordButton');
        window.location.href = '/settings/account/password';
        log.stepOut();
    };
    /**
     * @method  onClickLeaveButton
     */
    SettingsView.prototype.onClickLeaveButton = function () {
        var log = slog.stepIn(SettingsView.CLS_NAME, 'onClickLeaveButton');
        $.ajax({
            type: 'DELETE',
            url: "/api/settings/account/leave"
        })
            .done(function (data, status, jqXHR) {
            var log = slog.stepIn(SettingsView.CLS_NAME, 'leave.done');
            if (data.status === 0) {
                location.href = '/';
            }
            else {
                $('#message').text(data.message);
            }
            log.stepOut();
        })
            .fail(function (jqXHR, status, error) {
            var log = slog.stepIn(SettingsView.CLS_NAME, 'leave.fail');
            log.stepOut();
        });
        log.stepOut();
    };
    /**
     * @method  onClickBackButton
     */
    SettingsView.prototype.onClickBackButton = function () {
        var log = slog.stepIn(SettingsView.CLS_NAME, 'onClickBackButton');
        window.location.href = '/';
        log.stepOut();
    };
    /**
     * @method  login
     */
    SettingsView.prototype.link = function (sns) {
        var log = slog.stepIn(SettingsView.CLS_NAME, 'link');
        $.ajax({
            type: 'POST',
            url: "/api/settings/account/link/" + sns
        })
            .done(function (data, status, jqXHR) {
            var log = slog.stepIn(SettingsView.CLS_NAME, 'link.done');
            if (data.status === 0) {
                location.href = data.redirect;
            }
            else {
                $('#message').text(data.message);
            }
            log.stepOut();
        })
            .fail(function (jqXHR, status, error) {
            var log = slog.stepIn(SettingsView.CLS_NAME, 'link.fail');
            log.stepOut();
        });
        log.stepOut();
    };
    SettingsView.CLS_NAME = 'SettingsView';
    return SettingsView;
}());
/**
 * onLoad
 */
window.addEventListener('load', function () {
    var view = new SettingsView();
}, false);
if (window.location.hash === '#_=_') {
    // facebookのコールバックでなぜかゴミが付いてくるので取り除く
    //  window.location.hash = '';
    window.history.pushState('', document.title, window.location.pathname);
}
