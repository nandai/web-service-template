/**
 * (C) 2016-2017 printf.jp
 */
import bind                 from 'bind-decorator';
import * as React           from 'react';
import * as ReactDOM        from 'react-dom';

import {Response}           from 'libs/response';
import {slog}               from 'libs/slog';
import SettingsApi          from '../api/settings-api';
import Root                 from '../components/root';
import {BaseStore}          from '../components/views/base-store';
import History, {Direction} from '../libs/history';
import R                    from '../libs/r';
import {SocketEventData}    from '../libs/socket-event-data';
import Utils                from '../libs/utils';
import {Data}               from './methods/data';
import {initRoutes}         from './methods/initRoutes';
import {setAccount}         from './methods/setAccount';
import {setOnline}          from './methods/setOnline';
import {updateCurrentRoute} from './methods/updateCurrentRoute';

import socketIO = require('socket.io-client');

/**
 * wst app
 */
class WstApp
{
    data : Data =
    {
        apps:         null,
        currentRoute: null,
        routes:       null,
        account:      null
    };

    /**
     * 初期化
     */
    init()
    {
        const log = slog.stepIn('WstApp', 'init');
        const {data} = this;

        initRoutes(data);
        data.routes.forEach((route) =>
        {
            const {app} = route;
            app.render = this.render;
            app.store.onPageTransitionEnd = this.onPageTransitionEnd;
        });

        const ssrStore = Utils.getSsrStore<BaseStore>();
        setAccount(data, ssrStore.account);

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
        ReactDOM.render(
            <Root apps={this.data.apps} />,
            document.getElementById('root'));
    }

    /**
     * pushstate, popstate event
     */
    @bind
    private onHistory(direction : Direction, message? : string)
    {
        const log = slog.stepIn('WstApp', 'onHistory');
        return new Promise(async (resolve) =>
        {
            const {data} = this;
            data.routes.forEach((route) =>
            {
                route.app.store.direction = direction;
                route.app.store.highPriorityEffect = null;
            });

            const prevApp = data.currentRoute.app;
            await updateCurrentRoute(data, location.pathname, true, message);
            this.render();

            if (prevApp !== data.currentRoute.app)
            {
                const {apps} = data;
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
     * ページ遷移終了イベント
     */
    @bind
    onPageTransitionEnd()
    {
        const log = slog.stepIn('WstApp', 'onPageTransitionEnd');
        this.data.apps.changeCurrentApp();
        this.render();
        log.stepOut();
    }

    /**
     * ソケットイベント通知
     */
    private notifySocketEvent(data : SocketEventData) : void
    {
        this.data.routes.forEach((route) =>
        {
            route.app.notifySocketEvent(data);
        });
    }

    /**
     * ソケットに接続する
     */
    @bind
    private connectSocket()
    {
        const log = slog.stepIn('WstApp', 'connectSocket');
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
        const log = slog.stepIn('WstApp', 'onConnect');

        try
        {
            const {data} = this;
            setOnline(data, true);

            const res : Response.GetAccount = await SettingsApi.getAccount();
            const {account} = res;

            if (account)
            {
                const route = data.currentRoute;
                const params = Utils.getParamsFromUrl(location.pathname, route.url);
                await route.app.init(params);

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
        const log = slog.stepIn('WstApp', 'onDisconnect');
        setOnline(this.data, false);
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
        const log = slog.stepIn('WstApp', 'onNotifyUpdateAccount');
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
        const log = slog.stepIn('WstApp', 'onNotifyUpdateUser');
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
        const log = slog.stepIn('WstApp', 'onNotifyDeleteUser');
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
        const log = slog.stepIn('WstApp', 'onNotifyLogout');
        this.deliverLogout();
        log.stepOut();
    }

    /**
     * アカウント更新通知を配信
     */
    private deliverUpdateAccount(account : Response.Account) : void
    {
        const {data} = this;
        const isLogin = (data.account === null && account);
        setAccount(data, account);

        if (isLogin && data.currentRoute.url === '/')
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
        const {data} = this;
        const route = data.currentRoute;
        setAccount(data, null);

        if (route.auth)
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

    const app = new WstApp();
    app.init();

    await updateCurrentRoute(app.data, url, false);
    app.render();
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
