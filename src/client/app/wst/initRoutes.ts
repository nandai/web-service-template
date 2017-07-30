/**
 * (C) 2016-2017 printf.jp
 */
import ForbiddenApp                  from 'client/app/forbidden-app';
import ForgetApp                     from 'client/app/forget-app';
import JoinApp                       from 'client/app/join-app';
import LoginApp                      from 'client/app/login-app';
import NotFoundApp                   from 'client/app/not-found-app';
import ResetApp                      from 'client/app/reset-app';
import SettingsAccountApp            from 'client/app/settings-account-app';
import SettingsAccountEmailApp       from 'client/app/settings-account-email-app';
import SettingsAccountEmailChangeApp from 'client/app/settings-account-email-change-app';
import SettingsAccountPasswordApp    from 'client/app/settings-account-password-app';
import SettingsApp                   from 'client/app/settings-app';
import SettingsInviteApp             from 'client/app/settings-invite-app';
import SignupApp                     from 'client/app/signup-app';
import SignupConfirmApp              from 'client/app/signup-confirm-app';
import SmsApp                        from 'client/app/sms-app';
import TopApp                        from 'client/app/top-app';
import UserApp                       from 'client/app/user-app';
import UsersApp                      from 'client/app/users-app';
import R                             from 'client/libs/r';
import Utils                         from 'client/libs/utils';
import {Data}                        from './data';

 /**
  * Routes初期化
  */
export function initRoutes(data : Data)
{
    const locale = Utils.getLocale();
    const loginApp =    new LoginApp();
    const notFoundApp = new NotFoundApp();

    data.routes =
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
}
