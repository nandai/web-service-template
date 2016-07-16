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
class SignupView extends View
{
    private static CLS_NAME = 'SignupView';

    private twitterButton;
    private facebookButton;
    private googleButton;
    private emailTextBox;
    private passwordTextBox;
    private signupButton;
    private topButton;

    /**
     * 初期化
     */
    protected init(isResize : boolean) : void
    {
        const log = slog.stepIn(SignupView.CLS_NAME, 'init');

        const $emailTextBox =    $('#email');
        const $passwordTextBox = $('#password');

        this.twitterButton =   new sulas.Button('#twitter',  0, 50, 'twitterでサインアップする');
        this.facebookButton =  new sulas.Button('#facebook', 0, 50, 'facebookサインアップする');
        this.googleButton =    new sulas.Button('#google',   0, 50, 'googleでサインアップする');
        this.emailTextBox =    new sulas.TextBox($emailTextBox,    $emailTextBox.   width(), 30, 'メールアドレス', 'email');
        this.passwordTextBox = new sulas.TextBox($passwordTextBox, $passwordTextBox.width(), 30, 'パスワード',    'password');
        this.signupButton =    new sulas.Button('#signup',   0, 50, 'サインアップ');
        this.topButton =       new sulas.Button('#top',      0, 50, 'トップ画面へ');

        this.twitterButton. on('click', this.onClickTwitterButton. bind(this));
        this.facebookButton.on('click', this.onClickFacebookButton.bind(this));
        this.googleButton.  on('click', this.onClickGoogleButton.  bind(this));
        this.signupButton.  on('click', this.onClickSignupButton.  bind(this));
        this.topButton.     on('click', this.onClickTopButton.     bind(this));

        log.stepOut();
    }

    /**
     * @method  onClickTwitterButton
     */
    private onClickTwitterButton() : void
    {
        const log = slog.stepIn(SignupView.CLS_NAME, 'onClickTwitterButton');
        location.href = '/signup/twitter';
        log.stepOut();
    }

    /**
     * @method  onClickFacebookButton
     */
    private onClickFacebookButton() : void
    {
        const log = slog.stepIn(SignupView.CLS_NAME, 'onClickFacebookButton');
        location.href = '/signup/facebook';
        log.stepOut();
    }

    /**
     * @method  onClickGoogleButton
     */
    private onClickGoogleButton() : void
    {
        const log = slog.stepIn(SignupView.CLS_NAME, 'onClickGoogleButton');
        location.href = '/signup/google';
        log.stepOut();
    }

    /**
     * @method  onClickSignupButton
     */
    private onClickSignupButton() : void
    {
        const log = slog.stepIn(SignupView.CLS_NAME, 'onClickSignupButton');
        this.signup('email',
        {
            email:    this.emailTextBox.   getValue(),
            password: this.passwordTextBox.getValue()
        });
        log.stepOut();
    }

    /**
     * @method  onClickTopButton
     */
    private onClickTopButton() : void
    {
        const log = slog.stepIn(SignupView.CLS_NAME, 'onClickTopButton');
        location.href = '/';
        log.stepOut();
    }

    /**
     * @method  signup
     */
    private signup(sns : string, data?) : void
    {
        const log = slog.stepIn(SignupView.CLS_NAME, 'signup');
        const $message = $('#message');

        $message.text('');
        $.ajax({
            type: 'POST',
            url: `/api/signup/${sns}`,
            data: data
        })

        .done((data, status, jqXHR) =>
        {
            const log = slog.stepIn(SignupView.CLS_NAME, 'signup.done');

            if (data.status === 0)
            {
                location.href = data.redirect;
            }
            else
            {
                $message.text(data.message);
            }

            log.stepOut();
        })

        .fail((jqXHR, status, error) =>
        {
            const log = slog.stepIn(SignupView.CLS_NAME, 'signup.fail');
            log.stepOut();
        });

        log.stepOut();
    }
}

window.addEventListener('load', () => new SignupView(), false);

if (window.location.hash === '#_=_')
    window.history.pushState('', document.title, window.location.pathname);
