/**
 * (C) 2016-2017 printf.jp
 */
import ForbiddenApp                  from 'client/app/forbidden-app';
import ForgetApp                     from 'client/app/forget-app';
import HomeApp                       from 'client/app/home-app';
import JoinApp                       from 'client/app/join-app';
import NotFoundApp                   from 'client/app/not-found-app';
import ResetApp                      from 'client/app/reset-app';
import SettingsAccountApp            from 'client/app/settings-account-app';
import SettingsAccountEmailApp       from 'client/app/settings-account-email-app';
import SettingsAccountEmailChangeApp from 'client/app/settings-account-email-change-app';
import SettingsAccountPasswordApp    from 'client/app/settings-account-password-app';
import SettingsApp                   from 'client/app/settings-app';
import SettingsInviteApp             from 'client/app/settings-invite-app';
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
    const homeApp =     new HomeApp();
    const notFoundApp = new NotFoundApp();

    data.routes =
    [
        {url:'/',                              app:new TopApp(),                        title:R.text(R.TOP,                           locale), auth:true},
        {url:'/',                              app:homeApp,                             title:R.text(R.LOGIN,                         locale)},
        {url:'/',                              app:new SmsApp(),                        title:R.text(R.AUTH_SMS,                      locale), query:true},
        {url:'/signup',                        app:homeApp,                             title:R.text(R.SIGNUP,                        locale)},
        {url:'/signup',                        app:new SignupConfirmApp(),              title:R.text(R.SIGNUP_CONFIRM,                locale), query:true},
        {url:'/join',                          app:new JoinApp(),                       title:R.text(R.JOIN,                          locale), query:true},
        {url:'/forget',                        app:new ForgetApp(),                     title:R.text(R.GO_FORGET,                     locale)},
        {url:'/reset',                         app:new ResetApp(),                      title:R.text(R.RESET_PASSWORD,                locale), query:true},
        {url:'/settings',                      app:new SettingsApp(),                   title:R.text(R.SETTINGS,                      locale), auth:true},
        {url:'/settings/account',              app:new SettingsAccountApp(),            title:R.text(R.SETTINGS_ACCOUNT,              locale), auth:true},
        {url:'/settings/account/email',        app:new SettingsAccountEmailApp(),       title:R.text(R.SETTINGS_ACCOUNT_EMAIL,        locale), auth:true},
        {url:'/settings/account/email/change', app:new SettingsAccountEmailChangeApp(), title:R.text(R.SETTINGS_ACCOUNT_EMAIL_CHANGE, locale), query:true},
        {url:'/settings/account/password',     app:new SettingsAccountPasswordApp(),    title:R.text(R.SETTINGS_ACCOUNT_PASSWORD,     locale), auth:true},
        {url:'/settings/invite',               app:new SettingsInviteApp(),             title:R.text(R.SETTINGS_INVITE,               locale), auth:true},
        {url:'/users/:id',                     app:new UserApp(),                       title:R.text(R.USER,                          locale)},
        {url:'/users',                         app:new UsersApp(),                      title:R.text(R.USER_LIST,                     locale)},
        {url:'/about',                         app:homeApp,                             title:R.text(R.ABOUT,                         locale)},
        {url:'403',                            app:new ForbiddenApp(),                  title:R.text(R.FORBIDDEN,                     locale)},
        {url:'404',                            app:notFoundApp,                         title:R.text(R.NOT_FOUND,                     locale)},
        {url:'404',                            app:notFoundApp,                         title:R.text(R.NOT_FOUND,                     locale), query:true}
    ];
}
