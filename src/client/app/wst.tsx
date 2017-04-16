/**
 * (C) 2016-2017 printf.jp
 */
import {App}      from './app';
import TopApp     from './index';
import LoginApp   from './login';
import SmsApp     from './sms';
import SignupApp  from './signup';
import ForgetApp  from './forget';
import History    from '../libs/history';
import R          from '../libs/r';
import Utils      from '../libs/utils';
import {Response} from 'libs/response';

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
            {url:'/',       app:new TopApp(),    title:R.text(R.TOP,       locale), auth:true},
            {url:'/',       app:new LoginApp(),  title:R.text(R.LOGIN,     locale)},
            {url:'/',       app:new SmsApp(),    title:R.text(R.AUTH_SMS,  locale), query:true},
            {url:'/signup', app:new SignupApp(), title:R.text(R.SIGNUP,    locale)},
            {url:'/forget', app:new ForgetApp(), title:R.text(R.GO_FORGET, locale)}
        ];

        this.setAccount(ssrStore.account);

        const setAccount = this.setAccount.bind(this);
        this.routes.forEach((route) =>
        {
            route.app.setAccount = setAccount;
        });

        History.on('pushstate', this.onHistory.bind(this));
        History.on('popstate',  this.onHistory.bind(this));
    }

    /**
     * render
     */
    render() : void
    {
        let route : Route;
        for (route of this.routes)
        {
            if (route.url !== location.pathname)
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
            document.title = route.title;

            if (this.currentApp.init)
                this.currentApp.init();
        }

        this.currentApp.render();
    }

    /**
     * pushstate, popstate event
     */
    private onHistory() : void {
      this.render();
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
            if ('account' in store)
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
window.addEventListener('DOMContentLoaded', () =>
{
    const app = new WstApp();
    app.init();
    app.render();
});

if (window.location.hash === '#_=_')
{
    // Facebookのコールバックでなぜかゴミが付いてくるので取り除く。
    window.history.pushState('', document.title, window.location.pathname);
}
