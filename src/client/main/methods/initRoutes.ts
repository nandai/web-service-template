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
    const notFoundApp = new NotFoundApp();

    data.routes =
    [
        {app:new TopApp(),                        auth:true},
        {app:new HomeApp()},
        {app:new SmsApp(),                        query:true},
        {app:new SignupConfirmApp(),              query:true},
        {app:new JoinApp(),                       query:true},
        {app:new ResetApp(),                      query:true},
        {app:new SettingsApp(),                   auth:true},
        {app:new SettingsAccountApp(),            auth:true},
        {app:new SettingsAccountEmailApp(),       auth:true},
        {app:new SettingsAccountEmailChangeApp(), query:true},
        {app:new SettingsAccountPasswordApp(),    auth:true},
        {app:new SettingsInviteApp(),             auth:true},
        {app:new UserApp()},
        {app:new UsersApp()},
        {app:new ForbiddenApp()},
        {app:notFoundApp},
        {app:notFoundApp,                         query:true}
    ];
}
