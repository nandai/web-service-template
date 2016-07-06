/**
 * (C) 2016 printf.jp
 */

/// <reference path='../typings/tsd.d.ts' />;

var sulas;
var slog;

/**
 * View
 */
class TopView
{
    private static CLS_NAME = 'TopView';

    private settingsButton = new sulas.Button('#settings', 0, 50, '設定画面へ');
    private logoutButton =   new sulas.Button('#logout',   0, 50, 'ログアウト');

    private account;

    /**
     * @constructor
     */
    constructor()
    {
        const log = slog.stepIn(TopView.CLS_NAME, 'constructor');

        this.settingsButton.on('click', this.onClickSettingsButton.bind(this));
        this.logoutButton.  on('click', this.onClickLogoutButton.  bind(this));

        log.stepOut();
    }

    /**
     * @method  onClickSettingsButton
     */
    private onClickSettingsButton() : void
    {
        const log = slog.stepIn(TopView.CLS_NAME, 'onClickSettingsButton');
        window.location.href = '/settings';
        log.stepOut();
    }

    /**
     * @method  onClickLogoutButton
     */
    private onClickLogoutButton() : void
    {
        const log = slog.stepIn(TopView.CLS_NAME, 'onClickLogoutButton');

        $.ajax({
            type: 'POST',
            url: `/api/logout`
        })

        .done((data, status, jqXHR) =>
        {
            const log = slog.stepIn(TopView.CLS_NAME, 'logout.done');
            location.href = '/';
            log.stepOut();
        })

        .fail((jqXHR, status, error) =>
        {
            const log = slog.stepIn(TopView.CLS_NAME, 'logout.fail');
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
    const view = new TopView();
}, false);

if (window.location.hash === '#_=_')
{
    // facebookのコールバックでなぜかゴミが付いてくるので取り除く
//  window.location.hash = '';
    window.history.pushState('', document.title, window.location.pathname);
}
