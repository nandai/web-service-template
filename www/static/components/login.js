/**
 * (C) 2016 printf.jp
 */
/// <reference path='../typings/tsd.d.ts' />;
var sulas;
var slog;
/**
 * View
 */
var LoginView = (function () {
    /**
     * @constructor
     */
    function LoginView() {
        var log = slog.stepIn(LoginView.CLS_NAME, 'constructor');
        var $emailTextBox = $('#email');
        var $passwordTextBox = $('#password');
        this.twitterButton = new sulas.Button('#twitter', 0, 50, 'twitterでログインする');
        this.facebookButton = new sulas.Button('#facebook', 0, 50, 'facebookでログインする');
        this.googleButton = new sulas.Button('#google', 0, 50, 'googleでログインする');
        this.emailTextBox = new sulas.TextBox($emailTextBox, $emailTextBox.width(), 30, 'メールアドレス', 'text');
        this.passwordTextBox = new sulas.TextBox($passwordTextBox, $passwordTextBox.width(), 30, 'パスワード', 'password');
        this.loginButton = new sulas.Button('#login', 0, 50, 'ログイン');
        this.signupButton = new sulas.Button('#signup', 0, 50, 'サインアップ画面へ');
        this.forgetButton = new sulas.Button('#forget', 0, 50, 'パスワードを忘れた');
        this.twitterButton.on('click', this.onClickTwitterButton.bind(this));
        this.facebookButton.on('click', this.onClickFacebookButton.bind(this));
        this.googleButton.on('click', this.onClickGoogleButton.bind(this));
        this.loginButton.on('click', this.onClickLoginButton.bind(this));
        this.signupButton.on('click', this.onClickSignupButton.bind(this));
        this.forgetButton.on('click', this.onClickForgetButton.bind(this));
        log.stepOut();
    }
    /**
     * @method  onClickTwitterButton
     */
    LoginView.prototype.onClickTwitterButton = function () {
        var log = slog.stepIn(LoginView.CLS_NAME, 'onClickTwitterButton');
        this.login('twitter');
        log.stepOut();
    };
    /**
     * @method  onClickFacebookButton
     */
    LoginView.prototype.onClickFacebookButton = function () {
        var log = slog.stepIn(LoginView.CLS_NAME, 'onClickFacebookButton');
        this.login('facebook');
        log.stepOut();
    };
    /**
     * @method  onClickGoogleButton
     */
    LoginView.prototype.onClickGoogleButton = function () {
        var log = slog.stepIn(LoginView.CLS_NAME, 'onClickGoogleButton');
        this.login('google');
        log.stepOut();
    };
    /**
     * @method  onClickLoginButton
     */
    LoginView.prototype.onClickLoginButton = function () {
        var log = slog.stepIn(LoginView.CLS_NAME, 'onClickLoginButton');
        this.login('email', {
            email: this.emailTextBox.getValue(),
            password: this.passwordTextBox.getValue()
        });
        log.stepOut();
    };
    /**
     * @method  onClickSignupButton
     */
    LoginView.prototype.onClickSignupButton = function () {
        var log = slog.stepIn(LoginView.CLS_NAME, 'onClickSignupButton');
        location.href = '/signup';
        log.stepOut();
    };
    /**
     * @method  onClickForgetButton
     */
    LoginView.prototype.onClickForgetButton = function () {
        var log = slog.stepIn(LoginView.CLS_NAME, 'onClickForgetButton');
        location.href = '/forget';
        log.stepOut();
    };
    /**
     * @method  login
     */
    LoginView.prototype.login = function (sns, data) {
        var log = slog.stepIn(LoginView.CLS_NAME, 'login');
        $.ajax({
            type: 'POST',
            url: "/api/login/" + sns,
            data: data
        })
            .done(function (data, status, jqXHR) {
            var log = slog.stepIn(LoginView.CLS_NAME, 'login.done');
            if (data.status === 0) {
                location.href = data.redirect;
            }
            else {
                $('#message').text(data.message);
            }
            log.stepOut();
        })
            .fail(function (jqXHR, status, error) {
            var log = slog.stepIn(LoginView.CLS_NAME, 'login.fail');
            log.stepOut();
        });
        log.stepOut();
    };
    LoginView.CLS_NAME = 'LoginView';
    return LoginView;
}());
/**
 * onLoad
 */
window.addEventListener('load', function () {
    document.cookie = 'command=; expires=Thu, 01 Jan 1970 00:00:00 GMT';
    var view = new LoginView();
}, false);
if (window.location.hash === '#_=_') {
    // facebookのコールバックでなぜかゴミが付いてくるので取り除く
    //  window.location.hash = '';
    window.history.pushState('', document.title, window.location.pathname);
}
