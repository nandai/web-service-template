/**
 * (C) 2016 printf.jp
 */

/// <reference path='../typings/tsd.d.ts' />;

import View from './view';

const sulas = window['sulas'];
const slog =  window['slog'];

/**
 * View
 */
class LoginView extends View
{
    private static CLS_NAME = 'LoginView';

    private twitterButton;
    private facebookButton;
    private googleButton;
    private emailTextBox;
    private passwordTextBox;
    private loginButton;
    private signupButton;
    private forgetButton;

    /**
     * 初期化
     */
    protected init(isResize : boolean) : void
    {
        const log = slog.stepIn(LoginView.CLS_NAME, 'init');

        const $emailTextBox =    $('#email');
        const $passwordTextBox = $('#password');

        this.twitterButton =   new sulas.Button('#twitter',  0, 50, 'twitterでログインする');
        this.facebookButton =  new sulas.Button('#facebook', 0, 50, 'facebookでログインする');
        this.googleButton =    new sulas.Button('#google',   0, 50, 'googleでログインする');
        this.emailTextBox =    new sulas.TextBox($emailTextBox,    $emailTextBox.   width(), 30, 'メールアドレス', 'email');
        this.passwordTextBox = new sulas.TextBox($passwordTextBox, $passwordTextBox.width(), 30, 'パスワード',    'password');
        this.loginButton =     new sulas.Button('#login',    0, 50, 'ログイン');
        this.signupButton =    new sulas.Button('#signup',   0, 50, 'サインアップ画面へ');
        this.forgetButton =    new sulas.Button('#forget',   0, 50, 'パスワードを忘れた');

        this.twitterButton. on('click', this.onClickTwitterButton. bind(this));
        this.facebookButton.on('click', this.onClickFacebookButton.bind(this));
        this.googleButton.  on('click', this.onClickGoogleButton.  bind(this));
        this.loginButton.   on('click', this.onClickLoginButton.   bind(this));
        this.signupButton.  on('click', this.onClickSignupButton.  bind(this));
        this.forgetButton.  on('click', this.onClickForgetButton.  bind(this));

        log.stepOut();
    }

    /**
     * @method  onClickTwitterButton
     */
    private onClickTwitterButton() : void
    {
        const log = slog.stepIn(LoginView.CLS_NAME, 'onClickTwitterButton');
        location.href = '/login/twitter';
        log.stepOut();
    }

    /**
     * @method  onClickFacebookButton
     */
    private onClickFacebookButton() : void
    {
        const log = slog.stepIn(LoginView.CLS_NAME, 'onClickFacebookButton');
        location.href = '/login/facebook';
        log.stepOut();
    }

    /**
     * @method  onClickGoogleButton
     */
    private onClickGoogleButton() : void
    {
        const log = slog.stepIn(LoginView.CLS_NAME, 'onClickGoogleButton');
        location.href = '/login/google';
        log.stepOut();
    }

    /**
     * @method  onClickLoginButton
     */
    private onClickLoginButton() : void
    {
        const log = slog.stepIn(LoginView.CLS_NAME, 'onClickLoginButton');
        this.login('email',
        {
            email:    this.emailTextBox.   getValue(),
            password: this.passwordTextBox.getValue()
        });
        log.stepOut();
    }

    /**
     * @method  onClickSignupButton
     */
    private onClickSignupButton() : void
    {
        const log = slog.stepIn(LoginView.CLS_NAME, 'onClickSignupButton');
        location.href = '/signup';
        log.stepOut();
    }

    /**
     * @method  onClickForgetButton
     */
    private onClickForgetButton() : void
    {
        const log = slog.stepIn(LoginView.CLS_NAME, 'onClickForgetButton');
        location.href = '/forget';
        log.stepOut();
    }

    /**
     * @method  login
     */
    private login(sns : string, data?) : void
    {
        const log = slog.stepIn(LoginView.CLS_NAME, 'login');

        $.ajax({
            type: 'POST',
            url: `/api/login/${sns}`,
            data: data
        })

        .done((data, status, jqXHR) =>
        {
            const log = slog.stepIn(LoginView.CLS_NAME, 'login.done');

            if (data.status === 0)
            {
                location.href = (data.id === undefined ? '/' : `?id=${data.id}`);
            }
            else
            {
                $('#message').text(data.message);
            }

            log.stepOut();
        })

        .fail((jqXHR, status, error) =>
        {
            const log = slog.stepIn(LoginView.CLS_NAME, 'login.fail');
            log.stepOut();
        });

        log.stepOut();
    }
}

/**
 * onLoad
 */
window.addEventListener('load', () =>
{
    document.cookie = 'command=; expires=Thu, 01 Jan 1970 00:00:00 GMT';
    const view = new LoginView();
}, false);

if (window.location.hash === '#_=_')
{
    // Facebookのコールバックでなぜかゴミが付いてくるので取り除く。
    window.history.pushState('', document.title, window.location.pathname);
}
