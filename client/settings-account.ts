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
class SettingsAccountView extends View
{
    private static CLS_NAME = 'SettingsAccountView';

    private nameTextBox;
    private changeButton;

    /**
     * 初期化
     */
    protected init(isResize : boolean) : void
    {
        const log = slog.stepIn(SettingsAccountView.CLS_NAME, 'init');

        const $nameTextBox = $('#name');

        this.nameTextBox =   new sulas.TextBox($nameTextBox, $nameTextBox.width(), 30, '名前', 'text');
        this.changeButton = new sulas.Button('#change', 0, 50, '変更する');

        this.changeButton.on('click', this.onClickChangeButton.bind(this));

        $.ajax({
            type: 'GET',
            url: `/api/settings/account`
        })

        .done((data, status, jqXHR) =>
        {
            const account = data;
            this.nameTextBox.setValue(account.name);
        })

        .fail((jqXHR, status, error) =>
        {
        });

        log.stepOut();
    }

    /**
     * @method  onClickChangeButton
     */
    private onClickChangeButton() : void
    {
        const log = slog.stepIn(SettingsAccountView.CLS_NAME, 'onClickChangeButton');

        $.ajax({
            type: 'PUT',
            url: '/api/settings/account',
            data: {name:this.nameTextBox.getValue()}
        })

        .done((data, status, jqXHR) =>
        {
            const log = slog.stepIn(SettingsAccountView.CLS_NAME, 'settings-account.done');
            $('#message').text(data.message);
            log.stepOut();
        })

        .fail((jqXHR, status, error) =>
        {
            const log = slog.stepIn(SettingsAccountView.CLS_NAME, 'settings-account.fail');
            log.stepOut();
        });

        log.stepOut();
    }
}

window.addEventListener('load', () => new SettingsAccountView(), false);
