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
    data.routes =
    [
        {app:new TopApp()},
        {app:new HomeApp()},
        {app:new SmsApp()},
        {app:new SignupConfirmApp()},
        {app:new JoinApp()},
        {app:new ResetApp()},
        {app:new SettingsApp()},
        {app:new SettingsAccountApp()},
        {app:new SettingsAccountEmailApp()},
        {app:new SettingsAccountEmailChangeApp()},
        {app:new SettingsAccountPasswordApp()},
        {app:new SettingsInviteApp()},
        {app:new UserApp()},
        {app:new UsersApp()},
        {app:new ForbiddenApp()},
        {app:new NotFoundApp()}
    ];
}
