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
class SettingsView extends View
{
    private static CLS_NAME = 'SettingsView';

    private twitterButton;
    private facebookButton;
    private googleButton;
    private emailButton;
    private passwordButton;
    private accountButton;
    private leaveButton;
    private backButton;

    private account;

    /**
     * 初期化
     */
    protected init(isResize : boolean) : void
    {
        const log = slog.stepIn(SettingsView.CLS_NAME, 'init');

        this.twitterButton =  new sulas.Button('#twitter',  0, 50, 'twitterを紐づける');
        this.facebookButton = new sulas.Button('#facebook', 0, 50, 'facebookを紐づける');
        this.googleButton =   new sulas.Button('#google',   0, 50, 'googleを紐づける');
        this.emailButton =    new sulas.Button('#email',    0, 50, 'メールアドレスを設定する');
        this.passwordButton = new sulas.Button('#password', 0, 50, 'パスワードを設定する');
        this.accountButton =  new sulas.Button('#account',  0, 50, 'アカウント設定');
        this.leaveButton =    new sulas.Button('#leave',    0, 50, '退会する');
        this.backButton =     new sulas.Button('#back',     0, 50, '戻る');

        $.ajax({
            type: 'GET',
            url: `/api/settings/account`
        })

        .done((data, status, jqXHR) =>
        {
            this.account = data;
            $('#name').text(this.account.name);

            if (this.account.twitter)  this.twitterButton. setLabel('twitterとの紐づけを解除する');
            if (this.account.facebook) this.facebookButton.setLabel('facebookとの紐づけを解除する');
            if (this.account.google)   this.googleButton.  setLabel('googleとの紐づけを解除する');

            if (this.account.email === null)
                this.passwordButton.setEnabled(false);
        })

        .fail((jqXHR, status, error) =>
        {
        });

        this.twitterButton. on('click', this.onClickTwitterButton. bind(this));
        this.facebookButton.on('click', this.onClickFacebookButton.bind(this));
        this.googleButton.  on('click', this.onClickGoogleButton.  bind(this));
        this.emailButton.   on('click', this.onClickEmailButton.   bind(this));
        this.passwordButton.on('click', this.onClickPasswordButton.bind(this));
        this.accountButton. on('click', this.onClickAccountButton. bind(this));
        this.leaveButton.   on('click', this.onClickLeaveButton.   bind(this));
        this.backButton.    on('click', this.onClickBackButton.    bind(this));

        log.stepOut();
    }

    /**
     * @method  onClickTwitterButton
     */
    private onClickTwitterButton() : void
    {
        const log = slog.stepIn(SettingsView.CLS_NAME, 'onClickTwitterButton');
        location.href = '/settings/account/link/twitter';
        log.stepOut();
    }

    /**
     * @method  onClickFacebookButton
     */
    private onClickFacebookButton() : void
    {
        const log = slog.stepIn(SettingsView.CLS_NAME, 'onClickFacebookButton');
        location.href = '/settings/account/link/facebook';
        log.stepOut();
    }

    /**
     * @method  onClickGoogleButton
     */
    private onClickGoogleButton() : void
    {
        const log = slog.stepIn(SettingsView.CLS_NAME, 'onClickGoogleButton');
        location.href = '/settings/account/link/google';
        log.stepOut();
    }

    /**
     * @method  onClickEmailButton
     */
    private onClickEmailButton() : void
    {
        const log = slog.stepIn(SettingsView.CLS_NAME, 'onClickEmailButton');
        window.location.href = '/settings/account/email';
        log.stepOut();
    }

    /**
     * @method  onClickPasswordButton
     */
    private onClickPasswordButton() : void
    {
        const log = slog.stepIn(SettingsView.CLS_NAME, 'onClickPasswordButton');
        window.location.href = '/settings/account/password';
        log.stepOut();
    }

    /**
     * @method  onClickAccountButton
     */
    private onClickAccountButton() : void
    {
        const log = slog.stepIn(SettingsView.CLS_NAME, 'onClickAccountButton');
        window.location.href = '/settings/account';
        log.stepOut();
    }

    /**
     * @method  onClickLeaveButton
     */
    private onClickLeaveButton() : void
    {
        const log = slog.stepIn(SettingsView.CLS_NAME, 'onClickLeaveButton');

        $.ajax({
            type: 'DELETE',
            url: `/api/settings/account/leave`
        })

        .done((data, status, jqXHR) =>
        {
            const log = slog.stepIn(SettingsView.CLS_NAME, 'leave.done');

            if (data.status === 0)
            {
                location.href = '/';
            }
            else
            {
                $('#message').text(data.message);
            }

            log.stepOut();
        })

        .fail((jqXHR, status, error) =>
        {
            const log = slog.stepIn(SettingsView.CLS_NAME, 'leave.fail');
            log.stepOut();
        });

        log.stepOut();
    }

    /**
     * @method  onClickBackButton
     */
    private onClickBackButton() : void
    {
        const log = slog.stepIn(SettingsView.CLS_NAME, 'onClickBackButton');
        window.location.href = '/';
        log.stepOut();
    }
}

window.addEventListener('load', () => new SettingsView(), false);

if (window.location.hash === '#_=_')
    window.history.pushState('', document.title, window.location.pathname);
