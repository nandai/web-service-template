/**
 * (C) 2016-2017 printf.jp
 */
import bind                          from 'bind-decorator';
import * as React                    from 'react';
import * as ReactDOM                 from 'react-dom';

import {Response}                    from 'libs/response';
import {slog}                        from 'libs/slog';
import SettingsApi                   from '../api/settings-api';
import Root                          from '../components/root';
import {BaseStore}                   from '../components/views/base-store';
import History                       from '../libs/history';
import R                             from '../libs/r';
import {SocketEventData}             from '../libs/socket-event-data';
import Utils                         from '../libs/utils';
import {App}                         from './app';
import ForbiddenApp                  from './forbidden-app';
import ForgetApp                     from './forget-app';
import JoinApp                       from './join-app';
import LoginApp                      from './login-app';
import NotFoundApp                   from './not-found-app';
import ResetApp                      from './reset-app';
import SettingsAccountApp            from './settings-account-app';
import SettingsAccountEmailApp       from './settings-account-email-app';
import SettingsAccountEmailChangeApp from './settings-account-email-change-app';
import SettingsAccountPasswordApp    from './settings-account-password-app';
import SettingsApp                   from './settings-app';
import SettingsInviteApp             from './settings-invite-app';
import SignupApp                     from './signup-app';
import SignupConfirmApp              from './signup-confirm-app';
import SmsApp                        from './sms-app';
import TopApp                        from './top-app';
import UserApp                       from './user-app';
import UsersApp                      from './users-app';

import _ =        require('lodash');
import socketIO = require('socket.io-client');

/**
 * wst app
 */
class WstApp
{
    private currentRoute : Route =   null;
    private routes       : Route[] = null;
    private rootEffect   : string;
    private account      : Response.Account;

    /**
     * 初期化
     */
    init()
    {
        const log = slog.stepIn('WstApp', 'init');
        const locale = Utils.getLocale();
        const loginApp =    new LoginApp();
        const notFoundApp = new NotFoundApp();

        this.routes =
        [
            {url:'/',                              app:new TopApp(),                        title:R.text(R.TOP,                            locale), effect:'fade', auth:true},
            {url:'/',                              app:loginApp,                            title:R.text(R.LOGIN,                          locale), effect:'fade'},
            {url:'/',                              app:new SmsApp(),                        title:R.text(R.AUTH_SMS,                       locale), effect:'fade', query:true},
            {url:'/signup',                        app:new SignupApp(),                     title:R.text(R.SIGNUP,                         locale), effect:'fade'},
            {url:'/signup',                        app:new SignupConfirmApp(),              title:R.text(R.SIGNUP_CONFIRM,                 locale), effect:'fade', query:true},
            {url:'/join',                          app:new JoinApp(),                       title:R.text(R.JOIN,                           locale), effect:'fade', query:true},
            {url:'/forget',                        app:new ForgetApp(),                     title:R.text(R.GO_FORGET,                      locale), effect:'fade'},
            {url:'/reset',                         app:new ResetApp(),                      title:R.text(R.RESET_PASSWORD,                 locale), effect:'fade', query:true},
            {url:'/settings',                      app:new SettingsApp(),                   title:R.text(R.SETTINGS,                       locale), effect:'fade', auth:true},
            {url:'/settings/account',              app:new SettingsAccountApp(),            title:R.text(R.SETTINGS_ACCOUNT,               locale), effect:'none', auth:true},
            {url:'/settings/account/email',        app:new SettingsAccountEmailApp(),       title:R.text(R.SETTINGS_ACCOUNT_EMAIL,         locale), effect:'none', auth:true},
            {url:'/settings/account/email/change', app:new SettingsAccountEmailChangeApp(), title:R.text(R.SETTINGS_ACCOUNT_EMAIL_CHANGE,  locale), effect:'none', query:true},
            {url:'/settings/account/password',     app:new SettingsAccountPasswordApp(),    title:R.text(R.SETTINGS_ACCOUNT_PASSWORD,      locale), effect:'none', auth:true},
            {url:'/settings/invite',               app:new SettingsInviteApp(),             title:R.text(R.SETTINGS_INVITE,                locale), effect:'fade', auth:true},
            {url:'/users/:id',                     app:new UserApp(),                       title:R.text(R.USER,                           locale), effect:'fade'},
            {url:'/users',                         app:new UsersApp(),                      title:R.text(R.USER_LIST,                      locale), effect:'fade'},
            {url:'/about',                         app:loginApp,                            title:R.text(R.ABOUT,                          locale), effect:'fade'},
            {url:'403',                            app:new ForbiddenApp(),                  title:R.text(R.FORBIDDEN,                      locale), effect:'fade'},
            {url:'404',                            app:notFoundApp,                         title:R.text(R.NOT_FOUND,                      locale), effect:'fade'},
            {url:'404',                            app:notFoundApp,                         title:R.text(R.NOT_FOUND,                      locale), effect:'fade', query:true}
        ];

        this.routes.forEach((route) => route.app.render = this.render);

        const ssrStore = Utils.getSsrStore<BaseStore>();
        this.setAccount(ssrStore.account);
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
        const route = this.currentRoute;
        const app = route.app;

        ReactDOM.render(
            <Root app={app} effect={this.rootEffect} onChangeApp={this.onChangeApp} />,
            document.getElementById('root'));
    }

    /**
     * カレントRoute更新
     *
     * @param   url     URL
     * @param   isInit  app.init()をコールするかどうか。初回（DOMContentLoaded時）は不要（SSR Storeを使用してレンダリングするため）
     */
    updateCurrentRoute(url : string, isInit : boolean, message? : string)
    {
        const log = slog.stepIn('WstApp', 'updateCurrentRoute');
        return new Promise(async (resolve : () => void) =>
        {
            let routeResult = this.getRoute(url);
            if (routeResult.route === null) {
                routeResult = this.getRoute('404');
            }

            let route =    routeResult.route;
            const params = routeResult.params;

            if (this.currentRoute !== route)
            {
                log.d(route.title);
                if (isInit)
                {
                    try
                    {
                        await route.app.init(params, message);
                        this.setCurrentRoute(route);
                    }
                    catch (err)
                    {
                        console.warn(err.message);
                        routeResult = this.getRoute('404');
                        route = routeResult.route;
                        this.setCurrentRoute(route);
                    }
                }
                else
                {
                    this.setCurrentRoute(route);
                }
            }

            document.title = route.title;
            log.stepOut();
            resolve();
        });
    }

    /**
     * カレントRoute設定
     */
    private setCurrentRoute(route : Route) : void
    {
        this.currentRoute = route;
    }

    /**
     * route取得
     */
    private getRoute(url : string)
    {
        let route : Route = null;
        let params;

        for (const _route of this.routes)
        {
            params = Utils.getParamsFromUrl(url, _route.url);

            if (params === null) {
                continue;
            }

            if (_route.auth && this.account === null) {
                continue;
            }

            if (_route.query !== true && location.search === '')
            {
                route = _route;
                break;
            }

            if (_route.query === true && location.search !== '')
            {
                route = _route;
                break;
            }
        }

        return {route, params};
    }

    /**
     * pushstate, popstate event
     */
    @bind
    private onHistory(direction : string, message? : string)
    {
        const log = slog.stepIn('WstApp', 'onHistory');
        return new Promise(async (resolve) =>
        {
            // アカウント情報の再取得と再設定
            // try
            // {
            //     const res : Response.GetAccount = await SettingsApi.getAccount();
            //     this.setAccount(res.account);
            // }
            // catch (err)
            // {
            //     console.warn(err.message);
            // }
            this.setAccount(this.account);

            // 画面遷移時のエフェクト設定
            if (direction === 'back')
            {
                // 戻る場合は遷移元のエフェクトを使用
                this.rootEffect = this.currentRoute.effect;
            }

            await this.updateCurrentRoute(location.pathname, true, message);

            if (direction === 'forward')
            {
                // 進む場合は繊維先のエフェクトを使用
                this.rootEffect = this.currentRoute.effect;
            }

            this.render();
            log.stepOut();
            resolve();
        });
    }

    /**
     * onChangeApp
     */
    @bind
    private onChangeApp(prevApp : App, currentApp : App) : void
    {
        prevApp   .store.active = false;
        currentApp.store.active = true;
    }

    /**
     * アカウント設定
     */
    private setAccount(account : Response.Account) : void
    {
        account = account || null;
        this.account = account;

        this.routes.forEach((route) =>
        {
            const store = route.app.store;
            store.account = _.clone(account);
        });
    }

    /**
     * オンライン設定
     */
    private setOnline(online : boolean) : void
    {
        this.routes.forEach((route) =>
        {
            const store = route.app.store;
            store.online = online;
        });
    }

    /**
     * ソケットイベント通知
     */
    private notifySocketEvent(data : SocketEventData) : void
    {
        this.routes.forEach((route) =>
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
    async onConnect()
    {
        const log = slog.stepIn('WstApp', 'onConnect');

        try
        {
            this.setOnline(true);

            const res : Response.GetAccount = await SettingsApi.getAccount();
            const {account} = res;

            if (account)
            {
                const route = this.currentRoute;
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
    onDisconnect(reason : string)
    {
        const log = slog.stepIn('WstApp', 'onDisconnect');
        this.setOnline(false);
        this.render();
        log.w(reason);
        log.stepOut();
    }

    /**
     * アカウント更新通知
     */
    @bind
    onNotifyUpdateAccount(account : Response.Account)
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
    onNotifyUpdateUser(user : Response.User)
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
    onNotifyDeleteUser(userId : number)
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
    onNotifyLogout()
    {
        const log = slog.stepIn('WstApp', 'onNotifyLogout');
        this.deliverLogout();
        log.stepOut();
    }

    /**
     * アカウント更新通知を配信
     */
    deliverUpdateAccount(account : Response.Account)
    {
        const isLogin = (this.account === null && account);
        this.setAccount(account);

        if (isLogin && this.currentRoute.url === '/')
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
    deliverLogout()
    {
        const route = this.currentRoute;
        this.setAccount(null);

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
 * URL route
 */
interface Route
{
    url    : string;
    app    : App;
    title  : string;
    effect : string;
    query? : boolean;
    auth?  : boolean;
}

/**
 * onLoad
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

    await app.updateCurrentRoute(url, false);
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
