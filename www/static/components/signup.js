/**
 * (C) 2016 printf.jp
 */
/// <reference path='../typings/tsd.d.ts' />;
var sulas;
var slog;
/**
 * View
 */
var SignupView = (function () {
    /**
     * @constructor
     */
    function SignupView() {
        var log = slog.stepIn(SignupView.CLS_NAME, 'constructor');
        var $emailTextBox = $('#email');
        var $passwordTextBox = $('#password');
        this.twitterButton = new sulas.Button('#twitter', 0, 50, 'twitterでサインアップする');
        this.facebookButton = new sulas.Button('#facebook', 0, 50, 'facebookサインアップする');
        this.googleButton = new sulas.Button('#google', 0, 50, 'googleでサインアップする');
        this.emailTextBox = new sulas.TextBox($emailTextBox, $emailTextBox.width(), 30, 'メールアドレス', 'text');
        this.passwordTextBox = new sulas.TextBox($passwordTextBox, $passwordTextBox.width(), 30, 'パスワード', 'password');
        this.signupButton = new sulas.Button('#signup', 0, 50, 'サインアップ');
        this.topButton = new sulas.Button('#top', 0, 50, 'トップ画面へ');
        this.twitterButton.on('click', this.onClickTwitterButton.bind(this));
        this.facebookButton.on('click', this.onClickFacebookButton.bind(this));
        this.googleButton.on('click', this.onClickGoogleButton.bind(this));
        this.signupButton.on('click', this.onClickSignupButton.bind(this));
        this.topButton.on('click', this.onClickTopButton.bind(this));
        log.stepOut();
    }
    /**
     * @method  onClickTwitterButton
     */
    SignupView.prototype.onClickTwitterButton = function () {
        var log = slog.stepIn(SignupView.CLS_NAME, 'onClickTwitterButton');
        this.signup('twitter');
        log.stepOut();
    };
    /**
     * @method  onClickFacebookButton
     */
    SignupView.prototype.onClickFacebookButton = function () {
        var log = slog.stepIn(SignupView.CLS_NAME, 'onClickFacebookButton');
        this.signup('facebook');
        log.stepOut();
    };
    /**
     * @method  onClickGoogleButton
     */
    SignupView.prototype.onClickGoogleButton = function () {
        var log = slog.stepIn(SignupView.CLS_NAME, 'onClickGoogleButton');
        this.signup('google');
        log.stepOut();
    };
    /**
     * @method  onClickSignupButton
     */
    SignupView.prototype.onClickSignupButton = function () {
        var log = slog.stepIn(SignupView.CLS_NAME, 'onClickSignupButton');
        this.signup('email', {
            email: this.emailTextBox.getValue(),
            password: this.passwordTextBox.getValue()
        });
        log.stepOut();
    };
    /**
     * @method  onClickTopButton
     */
    SignupView.prototype.onClickTopButton = function () {
        var log = slog.stepIn(SignupView.CLS_NAME, 'onClickTopButton');
        location.href = '/';
        log.stepOut();
    };
    /**
     * @method  signup
     */
    SignupView.prototype.signup = function (sns, data) {
        var log = slog.stepIn(SignupView.CLS_NAME, 'signup');
        var $message = $('#message');
        $message.text('');
        $.ajax({
            type: 'POST',
            url: "/api/signup/" + sns,
            data: data
        })
            .done(function (data, status, jqXHR) {
            var log = slog.stepIn(SignupView.CLS_NAME, 'signup.done');
            if (data.status === 0) {
                location.href = data.redirect;
            }
            else {
                $message.text(data.message);
            }
            log.stepOut();
        })
            .fail(function (jqXHR, status, error) {
            var log = slog.stepIn(SignupView.CLS_NAME, 'signup.fail');
            log.stepOut();
        });
        log.stepOut();
    };
    SignupView.CLS_NAME = 'SignupView';
    return SignupView;
}());
/**
 * onLoad
 */
window.addEventListener('load', function () {
    var view = new SignupView();
}, false);
if (window.location.hash === '#_=_') {
    // facebookのコールバックでなぜかゴミが付いてくるので取り除く
    //  window.location.hash = '';
    window.history.pushState('', document.title, window.location.pathname);
}
