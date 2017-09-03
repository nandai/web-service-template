/**
 * (C) 2016-2017 printf.jp
 */
import bind                 from 'bind-decorator';

import {Response}           from 'libs/response';
import {slog}               from 'libs/slog';
import SettingsApi          from '../api/settings-api';
import {App}                from '../app/app';
import History, {Direction} from '../libs/history';
import R                    from '../libs/r';
import {SocketEventData}    from '../libs/socket-event-data';
import Utils                from '../libs/utils';
import MainApp              from './main-app';

import socketIO = require('socket.io-client');

/**
 * main
 */
class Main
{
    mainApp : MainApp;

    /**
     * 初期化
     */
    init()
    {
        const log = slog.stepIn('Main', 'init');

        App.render = this.render;
        this.mainApp = new MainApp();

        this.connectSocket();

        History.setCallback(this.onHistory);
        log.stepOut();
    }

    /**
     * render
     */
    @bind
    render() : void
    {
        this.mainApp.render();
    }

    /**
     * pushstate, popstate event
     */
    @bind
    private onHistory(direction : Direction, message? : string)
    {
        const log = slog.stepIn('Main', 'onHistory');
        return new Promise(async (resolve) =>
        {
            this.mainApp.childApps.forEach((subApp) =>
            {
                const {page} = subApp.store;
                page.direction = direction;
                page.highPriorityEffect = null;
            });

            const prevApp = this.mainApp.currentApp;
            await this.mainApp.updateCurrentApp(location.pathname, true, message);
            this.render();

            if (prevApp !== this.mainApp.currentApp)
            {
                const {apps} = this.mainApp;
                setTimeout(() =>
                {
                    apps.setActiveNextApp();
                    this.render();
                }, apps.getEffectDelay());
            }

            log.stepOut();
            resolve();
        });
    }

    /**
     * ソケットイベント通知
     */
    private notifySocketEvent(data : SocketEventData) : void
    {
        this.mainApp.childApps.forEach((subApp) =>
        {
            subApp.notifySocketEvent(data);
        });
    }

    /**
     * ソケットに接続する
     */
    @bind
    private connectSocket()
    {
        const log = slog.stepIn('Main', 'connectSocket');
        const io = socketIO.connect();
        io.on('connect',             this.onConnect);
        io.on('disconnect',          this.onDisconnect);
        io.on('notifyUpdateAccount', this.onNotifyUpdateAccount);
        io.on('notifyUpdateUser',    this.onNotifyUpdateUser);
        io.on('notifyDeleteUser',    this.onNotifyDeleteUser);
        io.on('notifyLogout',        this.onNotifyLogout);
        log.stepOut();
    }

    /**
     * connect event
     */
    @bind
    private async onConnect()
    {
        const log = slog.stepIn('Main', 'onConnect');

        try
        {
            this.mainApp.setOnline(true);

            const res : Response.GetAccount = await SettingsApi.getAccount();
            const {account} = res;

            if (account)
            {
                const params = Utils.getParamsFromUrl(location.pathname, this.mainApp.deepestApp.url);
                await this.mainApp.currentApp.init(params);

                this.deliverUpdateAccount(account);
            }
            else
            {
                this.deliverLogout();
            }

            log.stepOut();
        }
        catch (err) {log.w(err.message); log.stepOut();}
    }

    /**
     * disconnect event
     */
    @bind
    private onDisconnect(reason : string) : void
    {
        const log = slog.stepIn('Main', 'onDisconnect');
        this.mainApp.setOnline(false);
        this.render();
        log.w(reason);
        log.stepOut();
    }

    /**
     * アカウント更新通知
     */
    @bind
    private onNotifyUpdateAccount(account : Response.Account) : void
    {
        const log = slog.stepIn('Main', 'onNotifyUpdateAccount');
        log.d(JSON.stringify(account, null, 2));

        this.deliverUpdateAccount(account);
        log.stepOut();
    }

    /**
     * ユーザー更新通知
     */
    @bind
    private onNotifyUpdateUser(user : Response.User) : void
    {
        const log = slog.stepIn('Main', 'onNotifyUpdateUser');
        this.notifySocketEvent({notifyUpdateUser:user});
        this.render();
        log.stepOut();
    }

    /**
     * ユーザー削除通知
     */
    @bind
    private onNotifyDeleteUser(userId : number) : void
    {
        const log = slog.stepIn('Main', 'onNotifyDeleteUser');
        this.notifySocketEvent({notifyDeleteUser:{id:userId}});
        this.render();
        log.stepOut();
    }

    /**
     * ログアウト通知
     */
    @bind
    private onNotifyLogout() : void
    {
        const log = slog.stepIn('Main', 'onNotifyLogout');
        this.deliverLogout();
        log.stepOut();
    }

    /**
     * アカウント更新通知を配信
     */
    private deliverUpdateAccount(account : Response.Account) : void
    {
        const isLogin = (this.mainApp.account === null && account);
        this.mainApp.setAccount(account);

        if (isLogin && location.pathname === '/')
        {
            History.pushState('/');
        }
        else
        {
            this.render();
        }
    }

    /**
     * ログアウト通知を配信
     */
    private deliverLogout() : void
    {
        this.mainApp.setAccount(null);

        if (this.mainApp.deepestApp.auth)
        {
            History.pushState('/');
        }
        else
        {
            this.render();
        }
    }
}

/**
 * DOMContentLoaded
 */
window.addEventListener('DOMContentLoaded', async () =>
{
//  const serviceAddr = (('https:' === document.location.protocol) ? 'wss://localhost:8443' : 'ws://localhost:8080');
    const serviceAddr = 'ws://localhost:8080';
    slog.setConfig(serviceAddr, 'webServiceTemplate.log', 'ALL', 'slog', 'gols');

    slog.bind(
        console.log  .bind(console),
        console.info .bind(console),
        console.warn .bind(console),
        console.error.bind(console));

    const log = slog.stepIn('window', 'DOMContentLoaded');
    const locale = Utils.getLocale();
    let url = location.pathname;

    if (document.title === R.text(R.FORBIDDEN, locale)) {url = '403';}
    if (document.title === R.text(R.NOT_FOUND, locale)) {url = '404';}

    const main = new Main();
    main.init();

    await main.mainApp.updateCurrentApp(url, false);

    main.render();
    log.stepOut();
});

if (window.location.hash === '#_=_')
{
    // Facebookのコールバックでなぜかゴミが付いてくるので取り除く。
    History.replaceState(window.location.pathname);
}

if (location.protocol === 'http:' && location.hostname === 'localhost') {
    console.warn('ブラウザによっては http://localhost ではcookieが保存されません。IPを指定するか、またはhostsにlocalhost.comのようなドメインを定義してください。');
}
