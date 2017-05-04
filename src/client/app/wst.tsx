/**
 * (C) 2016-2017 printf.jp
 */
import * as React                    from 'react';
import * as ReactDOM                 from 'react-dom';
import {Response}                    from 'libs/response';
import {App}                         from './app';
import TopApp                        from './top';
import LoginApp                      from './login';
import SmsApp                        from './sms';
import SignupApp                     from './signup';
import SignupConfirmApp              from './signup-confirm';
import ForgetApp                     from './forget';
import ResetApp                      from './reset';
import SettingsApp                   from './settings';
import SettingsAccountApp            from './settings-account';
import SettingsAccountEmailApp       from './settings-account-email';
import SettingsAccountEmailChangeApp from './settings-account-email-change';
import SettingsAccountPasswordApp    from './settings-account-password';
import UsersApp                      from './users';
import ForbiddenApp                  from './forbidden';
import NotFoundApp                   from './not-found';
import SettingsApi                   from '../api/settings-api';
import Root                          from '../components/root';
import History                       from '../libs/history';
import R                             from '../libs/r';
import Utils                         from '../libs/utils';

const slog =     window['slog'];
const ssrStore = window['ssrStore'];

/**
 * wst app
 */
class WstApp
{
    private currentApp : App = null;
    private routes     : Route[] = null;
    private account    : Response.Account;

    /**
     * 初期化
     */
    init()
    {
        const locale = Utils.getLocale();
        this.routes =
        [
            {url:'/',                              app:new TopApp(),                        title:R.text(R.TOP,                            locale), auth:true},
            {url:'/',                              app:new LoginApp(),                      title:R.text(R.LOGIN,                          locale)},
            {url:'/',                              app:new SmsApp(),                        title:R.text(R.AUTH_SMS,                       locale), query:true},
            {url:'/signup',                        app:new SignupApp(),                     title:R.text(R.SIGNUP,                         locale)},
            {url:'/signup',                        app:new SignupConfirmApp(),              title:R.text(R.SIGNUP_CONFIRM,                 locale), query:true},
            {url:'/forget',                        app:new ForgetApp(),                     title:R.text(R.GO_FORGET,                      locale)},
            {url:'/reset',                         app:new ResetApp(),                      title:R.text(R.RESET_PASSWORD,                 locale), query:true},
            {url:'/settings',                      app:new SettingsApp(),                   title:R.text(R.SETTINGS,                       locale), auth:true},
            {url:'/settings/account',              app:new SettingsAccountApp(),            title:R.text(R.SETTINGS_ACCOUNT,               locale), auth:true},
            {url:'/settings/account/email',        app:new SettingsAccountEmailApp(),       title:R.text(R.SETTINGS_ACCOUNT_EMAIL,         locale), auth:true},
            {url:'/settings/account/email/change', app:new SettingsAccountEmailChangeApp(), title:R.text(R.SETTINGS_ACCOUNT_EMAIL_CHANGE,  locale), query:true},
            {url:'/settings/account/password',     app:new SettingsAccountPasswordApp(),    title:R.text(R.SETTINGS_ACCOUNT_PASSWORD,      locale), auth:true},
            {url:'/users',                         app:new UsersApp(),                      title:R.text(R.USER_LIST,                      locale)},
            {url:'403',                            app:new ForbiddenApp(),                  title:R.text(R.FORBIDDEN,                      locale)},
            {url:'404',                            app:new NotFoundApp(),                   title:R.text(R.NOT_FOUND,                      locale)},
        ];

        const render = this.render.bind(this);
        this.routes.forEach((route) =>
        {
            const store = route.app.render = render;
        });

        this.setAccount(ssrStore.account);

        History.on('pushstate', this.onHistory.bind(this));
        History.on('popstate',  this.onHistory.bind(this));
    }

    /**
     * render
     */
    render() : void
    {
        const view = this.currentApp.view();
        ReactDOM.render(
            <Root view={view} />,
            document.getElementById('root'));
    }

    /**
     * カレントApp更新
     */
    updateCurrentApp(url : string, isInit : boolean)
    {
        const log = slog.stepIn('WstApp', 'updateCurrentApp');
        return new Promise(async (resolve : () => void) =>
        {
            let route : Route;
            for (route of this.routes)
            {
                if (route.url !== url)
                    continue;

                if (route.auth && this.account === null)
                    continue;

                if (route.query !== true && location.search === '')
                    break;

                if (route.query === true && location.search !== '')
                    break;
            }

            if (this.currentApp !== route.app)
            {
                this.currentApp = route.app;
                document.title =  route.title;

                if (isInit)
                {
                    try
                    {
                        await this.currentApp.init();
                    }
                    catch (err)
                    {
                        console.warn(err.message);
                    }
                }

                this.render();
            }

            log.stepOut();
            resolve();
        });
    }

    /**
     * pushstate, popstate event
     */
    private onHistory()
    {
        const log = slog.stepIn('WstApp', 'onHistory');
        return new Promise(async (resolve) =>
        {
            let account : Response.Account = null;

            try
            {
                const res = await SettingsApi.getAccount();
                account = res.account;
            }
            catch (err)
            {
                console.warn(err.message);
            }

            this.setAccount(account);
            await this.updateCurrentApp(location.pathname, true);

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

    if (document.title === R.text(R.FORBIDDEN, locale)) url = '403';
    if (document.title === R.text(R.NOT_FOUND, locale)) url = '404';

    const app = new WstApp();
    app.init();
    await app.updateCurrentApp(url, false);
    log.stepOut();
});

if (window.location.hash === '#_=_')
{
    // Facebookのコールバックでなぜかゴミが付いてくるので取り除く。
    History.replaceState(window.location.pathname);
}

if (location.protocol === 'http:' && location.hostname === 'localhost')
    console.warn('ブラウザによっては http://localhost ではcookieが保存されません。IPを指定するか、またはhostsにlocalhost.comのようなドメインを定義してください。');
