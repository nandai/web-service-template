/**
 * (C) 2016-2017 printf.jp
 */
import * as React    from 'react';
import * as ReactDOM from 'react-dom';
import TopView       from './components/topView';

const slog =  window['slog'];

class TopApp
{
    private static CLS_NAME = 'TopApp';

    /**
     * @constructor
     */
    constructor()
    {
        this.onSettings = this.onSettings.bind(this);
        this.onLogout =   this.onLogout.  bind(this);
    }

    /**
     * render
     */
    render() : void
    {
        ReactDOM.render(
            <TopView onSettings = {this.onSettings}
                     onLogout =   {this.onLogout} />,
            document.getElementById('root'));
    }

    /**
     * onSettings
     */
    private onSettings() : void
    {
        const log = slog.stepIn(TopApp.CLS_NAME, 'onClickSettingsButton');
        window.location.href = '/settings';
        log.stepOut();
    }

    /**
     * onLogout
     */
    private onLogout() : void
    {
        const log = slog.stepIn(TopApp.CLS_NAME, 'onClickLogoutButton');

        $.ajax({
            type: 'POST',
            url: `/api/logout`
        })

        .done((data, status, jqXHR) =>
        {
            const log = slog.stepIn(TopApp.CLS_NAME, 'logout.done');
            location.href = '/';
            log.stepOut();
        })

        .fail((jqXHR, status, error) =>
        {
            const log = slog.stepIn(TopApp.CLS_NAME, 'logout.fail');
            log.stepOut();
        });

        log.stepOut();
    }
}

window.addEventListener('DOMContentLoaded', () => {
    const app = new TopApp();
    app.render();
});

window.history.pushState('', document.title, window.location.pathname);
