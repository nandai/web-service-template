/**
 * (C) 2016 printf.jp
 */

/// <reference path='../typings/tsd.d.ts' />;

import View from './view';
import R    from './r';

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

        this.twitterButton =   new sulas.Button('#twitter',  0, 50, R.text(R.SIGNUP_WITH_TWITTER));
        this.facebookButton =  new sulas.Button('#facebook', 0, 50, R.text(R.SIGNUP_WITH_FACEBOOK));
        this.googleButton =    new sulas.Button('#google',   0, 50, R.text(R.SIGNUP_WITH_GOOGLE));
        this.emailTextBox =    new sulas.TextBox($emailTextBox,    $emailTextBox.   width(), 30, R.text(R.EMAIL),    'email');
        this.passwordTextBox = new sulas.TextBox($passwordTextBox, $passwordTextBox.width(), 30, R.text(R.PASSWORD), 'password');
        this.signupButton =    new sulas.Button('#signup',   0, 50, R.text(R.SIGNUP));
        this.topButton =       new sulas.Button('#top',      0, 50, R.text(R.GO_TOP));

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
                location.href = '/';
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
