/**
 * (C) 2016-2017 printf.jp
 */
import * as React                    from 'react';
import * as ReactDOM                 from 'react-dom';

import {Response}                    from 'libs/response';
import SettingsApi                   from '../api/settings-api';
import Root                          from '../components/root';
import History                       from '../libs/history';
import R                             from '../libs/r';
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

const slog =     window['slog'];
const ssrStore = window['ssrStore'];

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

        const render = this.render.bind(this);
        this.routes.forEach((route) =>
        {
            const store = route.app.render = render;
        });

        this.setAccount(ssrStore.account);
        History.setCallback(this.onHistory.bind(this));
    }

    /**
     * render
     */
    render() : void
    {
        const route = this.currentRoute;
        const view = route.app.view();

        ReactDOM.render(
            <Root view={view} effect={this.rootEffect} />,
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
            let route : Route;
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

            if (this.currentRoute !== route)
            {
                this.currentRoute = route;

                if (isInit)
                {
                    try
                    {
                        await this.currentRoute.app.init(params, message);
                    }
                    catch (err)
                    {
                        console.warn(err.message);
                    }
                }
            }

            document.title = route.title;
            log.stepOut();
            resolve();
        });
    }

    /**
     * pushstate, popstate event
     */
    private onHistory(direction : string, message? : string)
    {
        const log = slog.stepIn('WstApp', 'onHistory');
        return new Promise(async (resolve) =>
        {
            // アカウント情報の再取得と再設定
            let account : Response.Account = null;

            try
            {
                const res : Response.GetAccount = await SettingsApi.getAccount();
                account = res.account;
            }
            catch (err)
            {
                console.warn(err.message);
            }

            this.setAccount(account);

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
     * アカウント設定
     */
    private setAccount(account : Response.Account) : void
    {
        account = account || null;
        this.account = account;

        this.routes.forEach((route) =>
        {
            const store = route.app['store'];
            if (store && 'account' in store)
            {
                store.account = account;
            }
        });
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
