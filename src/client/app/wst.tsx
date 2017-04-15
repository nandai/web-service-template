/**
 * (C) 2016-2017 printf.jp
 */
import LoginApp  from './login';
import SmsApp    from './sms';
import SignupApp from './signup';
import ForgetApp from './forget';
import History   from '../libs/history';
import R         from '../libs/r';
import Utils     from '../libs/utils';

/**
 * wst app
 */
class WstApp
{
    private currentApp = null;
    private loginApp =  new LoginApp();
    private smsApp =    new SmsApp();
    private signupApp = new SignupApp();
    private forgetApp = new ForgetApp();

    /**
     * 初期化
     */
    init()
    {
        History.on('pushstate', this.onHistory.bind(this));
        History.on('popstate',  this.onHistory.bind(this));
    }

    /**
     * render
     */
    render() : void
    {
        const locale = Utils.getLocale();
        const routes =
        [
            {url:'/',       app:this.loginApp,  title:R.text(R.LOGIN,     locale)},
            {url:'/',       app:this.smsApp,    title:R.text(R.AUTH_SMS,  locale), query:true},
            {url:'/signup', app:this.signupApp, title:R.text(R.SIGNUP,    locale)},
            {url:'/forget', app:this.forgetApp, title:R.text(R.GO_FORGET, locale)}
        ];

        let route;
        for (route of routes)
        {
            if (route.url === location.pathname)
            {
                if (route.query !== true && location.search === '')
                    break;

                if (route.query === true && location.search !== '')
                    break;
            }
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
