/**
 * (C) 2016-2017 printf.jp
 */
import ForbiddenApp                  from 'client/app/forbidden-app';
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
import {Data}                        from './data';

 /**
  * Routes初期化
  */
export function initRoutes(data : Data)
{
    const homeApp =     new HomeApp();
    const notFoundApp = new NotFoundApp();

    data.routes =
    [
        {url:'/',                              app:new TopApp(),                        auth:true},
        {url:'/',                              app:homeApp},
        {url:'/',                              app:new SmsApp(),                        query:true},
        {url:'/signup',                        app:homeApp},
        {url:'/signup',                        app:new SignupConfirmApp(),              query:true},
        {url:'/join',                          app:new JoinApp(),                       query:true},
        {url:'/forget',                        app:homeApp},
        {url:'/reset',                         app:new ResetApp(),                      query:true},
        {url:'/settings',                      app:new SettingsApp(),                   auth:true},
        {url:'/settings/account',              app:new SettingsAccountApp(),            auth:true},
        {url:'/settings/account/email',        app:new SettingsAccountEmailApp(),       auth:true},
        {url:'/settings/account/email/change', app:new SettingsAccountEmailChangeApp(), query:true},
        {url:'/settings/account/password',     app:new SettingsAccountPasswordApp(),    auth:true},
        {url:'/settings/invite',               app:new SettingsInviteApp(),             auth:true},
        {url:'/users/:id',                     app:new UserApp()},
        {url:'/users',                         app:new UsersApp()},
        {url:'/about',                         app:homeApp},
        {url:'403',                            app:new ForbiddenApp()},
        {url:'404',                            app:notFoundApp},
        {url:'404',                            app:notFoundApp,                         query:true}
    ];
}
