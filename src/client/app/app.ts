/**
 * (C) 2016-2017 printf.jp
 */
import bind                   from 'bind-decorator';

import {BaseStore}            from 'client/components/views/base-store';
import History                from 'client/libs/history';
import {pageNS}               from 'client/libs/page';
import PageTransition, {
       PageTransitionOptions} from 'client/libs/page-transition';
import {SocketEventData}      from 'client/libs/socket-event-data';
import Utils                  from 'client/libs/utils';
import {slog}                 from 'libs/slog';

type SetUrlResult = 'nomatch' | 'match' | 'transition';

export abstract class App
{
    abstract store        : BaseStore;
    url                   : string;
    query                 : boolean = false;
    auth                  : boolean = false;
    title                 : string;
    pageTransition        : PageTransition;
    pageTransitionOptions : PageTransitionOptions = {};
    childApps             : App[] = [];
    static render         : () => void;

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
    display() : void
    {
        const {page} = this.store;
        page.active = true;
        page.displayStatus = 'displayed';

        for (const childApp of this.childApps) {
            childApp.display();
        }
    }

    /**
     * 子Appの初期化
     */
    protected initChildApps() : void
    {
        for (const childApp of this.childApps)
        {
            const {page} = childApp.store;
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
        const log = slog.stepIn('App', 'init');
        return new Promise(async (resolve/* : (isSet : boolean) => void*/) =>
        {
            let result : SetUrlResult = 'nomatch';
            const pathname = location.pathname;

            for (const childApp of this.childApps)
            {
                const result2 = await childApp.init(params, message) as SetUrlResult;

                if (result2 !== 'nomatch')
                {
                    result = result2;
//                  pathname = childApp.url;
                }
            }

            if (result !== 'transition') {
                result = this.setUrl(pathname);
            }

            log.stepOut();
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

            if (childApp.pageTransition && childApp.getChildAppIndex(url) !== -1) {
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
        const log = slog.stepIn('App', 'setUrl');
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

        if (! app)
        {
            log.stepOut();
            return 'nomatch';
        }

        let result : SetUrlResult = 'match';
        if (! this.pageTransition)
        {
            // 初回設定時
            app.store.page.active = true;
            this.pageTransition = new PageTransition(app, this.pageTransitionOptions);
        }
        else
        {
            // 二度目以降
            const i = this.getChildAppIndex(History.referrerUrl);
            if (i === -1)
            {
                log.stepOut();
                return 'nomatch';
            }

            if (History.referrerUrl !== url)
            {
                const j = this.getChildAppIndex(url);
                History.direction = (i < j ? 'forward' : 'back');

                this.pageTransition.setNextApp(app);
                result = 'transition';

                setTimeout(() =>
                {
                    this.pageTransition.setActiveNextApp();
                    App.render();
                }, this.pageTransition.getEffectDelay());
            }
        }

        store.currentUrl = url;

        log.stepOut();
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
        if (this.pageTransition.changeDisplayStatus(page)) {
            App.render();
        }
    }
}
