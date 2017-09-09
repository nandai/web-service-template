/**
 * (C) 2016-2017 printf.jp
 */
import bind                 from 'bind-decorator';

import Apps, {AppsOptions}  from 'client/app/apps';
import {BaseStore}          from 'client/components/views/base-store';
import History, {Direction} from 'client/libs/history';
import {pageNS}             from 'client/libs/page';
import {SocketEventData}    from 'client/libs/socket-event-data';
import Utils                from 'client/libs/utils';
import {slog}               from 'libs/slog';

type SetUrlResult = 'nomatch' | 'match' | 'transition';

export abstract class App
{
    abstract store : BaseStore;
    url            : string;
    query          : boolean = false;
    auth           : boolean = false;
    title          : string;
    apps           : Apps;
    appsOptions    : AppsOptions = {};
    childApps      : App[] = [];
    static render  : () => void;

    /**
     * toString
     */
    abstract toString() : string;

    /**
     * factory
     */
    factory(_store : BaseStore) : App
    {
        return null;
    }

    /**
     *
     */
    protected initChildApps(active = false) : void
    {
        for (const childApp of this.childApps)
        {
            const {page} = childApp.store;
            page.active = active;
            page.onPageTransitionEnd = this.onPageTransitionEnd;
        }
    }

    /**
     * 初期化
     *
     * @param   params  URLに含まれるパラメータ（Utils.getParamsFromUrl参照）
     * @param   message 前画面から渡されるメッセージ（History.pushState参照）
     */
    init(params, message? : string)
    {
        return new Promise(async (resolve/* : (isSet : boolean) => void*/) =>
        {
            let result : SetUrlResult = 'nomatch';
            let pathname = location.pathname;

            for (const childApp of this.childApps)
            {
                const result2 = await childApp.init(params, message) as SetUrlResult;

                if (result2 !== 'nomatch')
                {
                    result = result2;
                    pathname = childApp.url;
                }
            }

            if (result !== 'transition') {
                result = this.setUrl(pathname);
            }

            resolve(result);
        });
    }

    /**
     * view
     */
    abstract view(i : number) : JSX.Element;

    /**
     * 子Appのインデックスを取得
     */
    private getChildAppIndex(url : string)
    {
        let i = 0;
        for (const childApp of this.childApps)
        {
            if (childApp.url === url) {
                return i;
            }
            i++;
        }
        return -1;
    }

    /**
     *
     */
    protected setUrl(url : string) : SetUrlResult
    {
        const {store} = this;
        const index = this.getChildAppIndex(url);
        let app = this.childApps[index];

        if (! app)
        {
            for (const childApp of this.childApps)
            {
                if (childApp.setUrl(url) !== 'nomatch')
                {
                    app = childApp;
                    break;
                }
            }
        }

        if (! app) {
            return 'nomatch';
        }

        let result : SetUrlResult = 'match';
        if (! this.apps)
        {
            // 初回設定時
            app.store.page.active = true;
            this.apps = new Apps(app, this.appsOptions);
        }
        else
        {
            // 二度目以降
            if (store.currentUrl !== url)
            {
                const i = this.getChildAppIndex(store.currentUrl);
                const j = this.getChildAppIndex(url);
                const direction : Direction = (i < j ? 'forward' : 'back');

                for (const childApp of this.childApps)
                {
                    const {page} = childApp.store;
                    page.direction = direction;
                }

                this.apps.setNextApp(app);
                result = 'transition';

                setTimeout(() =>
                {
                    this.apps.setActiveNextApp();
                    App.render();
                }, this.apps.getEffectDelay());
            }
        }

        store.currentUrl = url;
        return result;
    }

    /**
     * URLが一致するAppを検索する
     */
    findApp(url : string) : App
    {
        for (const childApp of this.childApps)
        {
            const params = Utils.getParamsFromUrl(url, childApp.url);

            if (params) {
                return childApp;
            }
        }

        for (const childApp of this.childApps)
        {
            const grandsonApp = childApp.findApp(url);

            if (grandsonApp) {
                return grandsonApp;
            }
        }

        return null;
    }

    /**
     * ソケットイベント通知
     */
    notifySocketEvent(_data : SocketEventData) : void
    {
    }

    /**
     * onBack
     */
    @bind
    protected onBack() : void
    {
        const log = slog.stepIn('App', 'onBack');
        History.back();
        log.stepOut();
    }

    /**
     * ページ遷移終了イベント
     */
    @bind
    protected onPageTransitionEnd(page : pageNS.Page)
    {
        if (this.apps.changeDisplayStatus(page)) {
            App.render();
        }
    }
}
