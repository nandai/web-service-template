/**
 * (C) 2016-2017 printf.jp
 */
import bind                          from 'bind-decorator';
import * as React                    from 'react';
import * as ReactDOM                 from 'react-dom';

import {App}                         from 'client/app/app';
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
import History                       from 'client/libs/history';
import PageTransition, {
       PageTransitionSetting}        from 'client/libs/page-transition';
import Utils                         from 'client/libs/utils';
import {Response}                    from 'libs/response';
import {slog}                        from 'libs/slog';

import _ = require('lodash');

export default class MainApp extends App
{
    store = null;
    account    : Response.Account;
    currentApp : App = null;
    deepestApp : App = null;

    /**
     * @constructor
     */
    constructor()
    {
        super();

        let ssrStore : BaseStore = {locale:'ja', page:{}};
        if (typeof window === 'object')
        {
            ssrStore = window['ssrStore'];
            History.setCallback(this.onHistory);
        }

        this.pageTransitionOptions =
        {
            settings:    pageTransitionSettings,
            effectDelay: 500
        };

        this.childApps =
        [
            new TopApp(ssrStore),
            new HomeApp(ssrStore),
            new SmsApp(ssrStore),
            new SignupConfirmApp(ssrStore),
            new JoinApp(ssrStore),
            new ResetApp(ssrStore),
            new SettingsApp(ssrStore),
            new SettingsAccountApp(ssrStore),
            new SettingsAccountEmailApp(ssrStore),
            new SettingsAccountEmailChangeApp(ssrStore),
            new SettingsAccountPasswordApp(ssrStore),
            new SettingsInviteApp(ssrStore),
            new UserApp(ssrStore),
            new UsersApp(ssrStore),
            new ForbiddenApp(ssrStore),
            new NotFoundApp(ssrStore),
            new NotFoundApp(ssrStore, true)
        ];

        this.initChildApps();
        this.setAccount(ssrStore.account);
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
        const {pageTransition} = this;
        const isDuringTransition = pageTransition.isDuringTransition();

        if (Button.noReaction && isDuringTransition === false) {
            setTimeout(() => Button.noReaction = false, 100);
        }

        ReactDOM.render(
            <Root pageTransition={pageTransition} />,
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
     * 各appのstoreにアカウント設定
     */
    setAccount(account : Response.Account) : void
    {
        account = account || null;
        this.account = account;

        this.childApps.forEach((subApp) =>
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
        this.childApps.forEach((childApp) =>
        {
            const store = childApp.store;
            store.online = online;
        });
    }

    /**
     * カレントApp設定
     */
    private setCurrentApp(currentApp : App, deepestApp : App) : void
    {
        if (! this.pageTransition)
        {
            // 初回設定時
            this.pageTransition = new PageTransition(currentApp, this.pageTransitionOptions);
            currentApp.store.page.active = true;
        }
        else
        {
            // 二度目以降
            this.pageTransition.setNextApp(currentApp);
        }

        this.currentApp = currentApp;
        this.deepestApp = deepestApp;
    }

    /**
     * route取得
     */
    getRoute(url : string, account? : Response.Account, hasQuery? : boolean)
    {
        account = account || this.account;
        if (hasQuery === undefined)
        {
            if (typeof location === 'object')
            {
                hasQuery = (location.search !== '');
            }
            else
            {
                hasQuery = false;
            }
        }

        let rootApp    : App = null;
        let deepestApp : App = null;
        let params;

        for (const childApp of this.childApps)
        {
            deepestApp = childApp.findApp(url) || childApp;
            params = Utils.getParamsFromUrl(url, deepestApp.url);
            const {auth, query} = deepestApp;

            if (params === null) {
                continue;
            }

            if (auth && ! account) {
                continue;
            }

            if (query && hasQuery === false) {
                continue;
            }

            if (query === false && hasQuery) {
                continue;
            }

            rootApp = childApp;
            break;
        }

        return {rootApp, deepestApp, params};
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
            if (routeResult.rootApp === null) {
                routeResult = this.getRoute('404');
            }

            let rootApp =    routeResult.rootApp;
            let deepestApp = routeResult.deepestApp;
            const params =   routeResult.params;
            const title = deepestApp.title;

            if (this.deepestApp !== deepestApp)
            {
                log.d(title);
                if (isInit)
                {
                    try
                    {
                        await rootApp.init(params, message);
                        this.setCurrentApp(rootApp, deepestApp);
                    }
                    catch (err)
                    {
                        console.warn(err.message);
                        routeResult = this.getRoute('404');
                        rootApp =    routeResult.rootApp;
                        deepestApp = routeResult.deepestApp;
                        this.setCurrentApp(rootApp, deepestApp);
                    }
                }
                else
                {
                    this.setCurrentApp(rootApp, deepestApp);
                }
            }

            document.title = title;
            log.stepOut();
            resolve();
        });
    }

    /**
     * pushstate, popstate event
     */
    @bind
    private onHistory(message? : string)
    {
        const log = slog.stepIn('Main', 'onHistory');
        return new Promise(async (resolve) =>
        {
            this.childApps.forEach((childApp) =>
            {
                const {page} = childApp.store;
                page.highPriorityEffect = null;
            });

            const prevApp = this.currentApp;
            await this.updateCurrentApp(location.pathname, true, message);
            this.render();

            if (prevApp !== this.currentApp)
            {
                const {pageTransition} = this;
                setTimeout(() =>
                {
                    pageTransition.setActiveNextApp();
                    this.render();
                }, pageTransition.getEffectDelay());
            }

            log.stepOut();
            resolve();
        });
    }
}

const pageTransitionSettings : PageTransitionSetting[] =
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
