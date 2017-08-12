/**
 * (C) 2016-2017 printf.jp
 */
import Apps, {AppTransition} from 'client/app/apps';
import {Data}                from './data';
import {Route}               from './route';

/**
 * カレントRoute設定
 */
export function setCurrentRoute(data : Data, route : Route) : void
{
    if (data.currentRoute === null)
    {
        // 初回設定時
        const options =
        {
            transitions,
            effectDelay: 500
        };
        data.apps = new Apps(route.app, options);
    }
    else
    {
        // 二度目以降
        data.apps.setNextApp(route.app);
    }

    data.currentRoute = route;
}

const transitions : AppTransition[] =
[
    {
        appName1:    'HomeApp',
        appName2:    'UsersApp',
        effect1:     'slide',
        effect2:     'slide'
    },

    {
        appName1:    'HomeApp',
        appName2:    'TopApp',
        bgTheme:     'black',
        effectDelay: 2000
    },

    {
        appName1:    'TopApp',
        appName2:    'SettingsApp',
        effect1:     'slide',
        effect2:     'slide'
    },

    {
        appName1:    'TopApp',
        appName2:    'SettingsInviteApp',
        effectDelay: 0
    },

    {
        appName1:    'UsersApp',
        appName2:    'UserApp',
        effectDelay: 0
    }
];
