/**
 * (C) 2016 printf.jp
 */
import View from './view';
import R    from './r';

const sulas = window['sulas'];
const slog =  window['slog'];

/**
 * View
 */
class TopView extends View
{
    private static CLS_NAME = 'TopView';

    private settingsButton;
    private logoutButton;

    /**
     * 初期化
     */
    protected init(isResize : boolean) : void
    {
        const log = slog.stepIn(TopView.CLS_NAME, 'init');

        this.settingsButton = new sulas.Button('#settings', 0, 50, R.text(R.GO_SETTINGS));
        this.logoutButton =   new sulas.Button('#logout',   0, 50, R.text(R.LOGOUT));

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

window.addEventListener('load', () => new TopView(), false);
window.history.pushState('', document.title, window.location.pathname);
