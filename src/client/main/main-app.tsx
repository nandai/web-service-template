/**
 * (C) 2016-2017 printf.jp
 */
import bind                          from 'bind-decorator';
import * as React                    from 'react';
import * as ReactDOM                 from 'react-dom';

import {App}                         from 'client/app/app';
import Apps, {AppTransition}         from 'client/app/apps';
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
import Button                        from 'client/components/common/button';
import Root                          from 'client/components/root';
import {BaseStore}                   from 'client/components/views/base-store';
import {pageNS}                      from 'client/libs/page';
import Utils                         from 'client/libs/utils';
import {Response}                    from 'libs/response';
import {slog}                        from 'libs/slog';

import _ = require('lodash');

export default class MainApp extends App
{
    store = null;
    account    : Response.Account;
    currentApp : App = null;
    targetApp  : App = null;

    /**
     * @constructor
     */
    constructor()
    {
        super();

        this.appsOptions =
        {
            transitions,
            effectDelay: 500
        };

        this.subApps =
        [
            new TopApp(),
            new HomeApp(),
            new SmsApp(),
            new SignupConfirmApp(),
            new JoinApp(),
            new ResetApp(),
            new SettingsApp(),
            new SettingsAccountApp(),
            new SettingsAccountEmailApp(),
            new SettingsAccountEmailChangeApp(),
            new SettingsAccountPasswordApp(),
            new SettingsInviteApp(),
            new UserApp(),
            new UsersApp(),
            new ForbiddenApp(),
            new NotFoundApp()
        ];

        this.initSubApps();

        const ssrStore = Utils.getSsrStore<BaseStore>();
        this.setAccount(ssrStore.account);
    }

    /**
     *
     */
    initSubApps() : void
    {
        for (const name in this.subApps)
        {
            const subApp : App = this.subApps[name];
            const {page} = subApp.store;
            page.onPageTransitionEnd = this.onPageTransitionEnd;
        }
    }

    /**
     * toString
     */
    toString() : string
    {
        return 'MainApp';
    }

    /**
     * render
     */
    render() : void
    {
        const {apps} = this;
        const isDuringTransition = apps.isDuringTransition();

        if (Button.noReaction && isDuringTransition === false) {
            setTimeout(() => Button.noReaction = false, 100);
        }

        ReactDOM.render(
            <Root apps={apps} />,
            document.getElementById('root'));
    }

    /**
     * view
     */
    view(_i : number) : JSX.Element
    {
        return null;
    }

    /**
     * ページ遷移終了イベント
     */
    @bind
    private onPageTransitionEnd(page : pageNS.Page)
    {
        if (this.apps.changeDisplayStatus(page)) {
            App.render();
        }
    }

    /**
     * 各appのstoreにアカウント設定
     */
    setAccount(account : Response.Account) : void
    {
        account = account || null;
        this.account = account;

        this.subApps.forEach((subApp) =>
        {
            const {store} = subApp;
            store.prevAccount = store.account;
            store.account = _.clone(account);
        });
    }

    /**
     * 各appのstoreにオンライン設定
     */
    setOnline(online : boolean) : void
    {
        this.subApps.forEach((subApp) =>
        {
            const store = subApp.store;
            store.online = online;
        });
    }

    /**
     * カレントApp設定
     */
    private setCurrentApp(currentApp : App, targetApp : App) : void
    {
        if (! this.apps)
        {
            // 初回設定時
            this.apps = new Apps(currentApp, this.appsOptions);
        }
        else
        {
            // 二度目以降
            this.apps.setNextApp(currentApp);
        }

        this.currentApp = currentApp;
        this.targetApp =  targetApp;
    }

    /**
     * route取得
     */
    private getRoute(url : string)
    {
        let routeApp  : App = null;
        let targetApp : App = null;
        let params;

        for (const subApp of this.subApps)
        {
            targetApp = subApp.getTargetApp(url) || subApp;
            params = Utils.getParamsFromUrl(url, targetApp.url);
            const {auth, query} = targetApp;

            if (params === null) {
                continue;
            }

            if (auth && this.account === null) {
                continue;
            }

            if (query === false || location.search !== '')
            {
                routeApp = subApp;
                break;
            }
        }

        return {routeApp, targetApp, params};
    }

    /**
     * カレントApp更新
     *
     * @param   url     URL
     * @param   isInit  app.init()をコールするかどうか。初回（DOMContentLoaded時）は不要（SSR Storeを使用してレンダリングするため）
     */
    updateCurrentApp(url : string, isInit : boolean, message? : string)
    {
        const log = slog.stepIn('MainApp', 'updateCurrentApp');
        return new Promise(async (resolve : () => void) =>
        {
            let routeResult = this.getRoute(url);
            if (routeResult.routeApp === null) {
                routeResult = this.getRoute('404');
            }

            let routeApp =  routeResult.routeApp;
            let targetApp = routeResult.targetApp;
            const params =  routeResult.params;
            const title = targetApp.title;

            if (this.targetApp !== targetApp)
            {
                log.d(title);
                if (isInit)
                {
                    try
                    {
                        await routeApp.init(params, message);
                        this.setCurrentApp(routeApp, targetApp);
                    }
                    catch (err)
                    {
                        console.warn(err.message);
                        routeResult = this.getRoute('404');
                        routeApp =  routeResult.routeApp;
                        targetApp = routeResult.targetApp;
                        this.setCurrentApp(routeApp, targetApp);
                    }
                }
                else
                {
                    this.setCurrentApp(routeApp, targetApp);
                }
            }

            document.title = title;
            log.stepOut();
            resolve();
        });
    }
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
