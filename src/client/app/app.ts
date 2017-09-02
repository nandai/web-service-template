/**
 * (C) 2016-2017 printf.jp
 */
import bind                 from 'bind-decorator';

import Apps, {AppsOptions}  from 'client/app/apps';
import {BaseStore}          from 'client/components/views/base-store';
import History, {Direction} from 'client/libs/history';
import {SocketEventData}    from 'client/libs/socket-event-data';
import Utils                from 'client/libs/utils';
import {slog}               from 'libs/slog';

type SetUrlResult = 'nomatch' | 'match' | 'transition';

export abstract class App
{
    abstract store    : BaseStore;
    url               : string;
    title             : string;
    apps              : Apps;
    appsOptions       : AppsOptions = {};
    protected subApps : App[] = [];
    static render     : () => void;

    /**
     * toString
     */
    abstract toString() : string;

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

            for (const subApp of this.subApps)
            {
                const result2 = await subApp.init(params, message) as SetUrlResult;

                if (result2 !== 'nomatch')
                {
                    result = result2;
                    pathname = subApp.url;
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
     *
     */
    private getSubAppIndex(url : string)
    {
        let i = 0;
        for (const subApp of this.subApps)
        {
            if (subApp.url === url) {
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
        const index = this.getSubAppIndex(url);
        let app = this.subApps[index];

        if (! app)
        {
            for (const subApp of this.subApps)
            {
                if (subApp.setUrl(url) !== 'nomatch')
                {
                    app = subApp;
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
            if (store.url !== url)
            {
                const i = this.getSubAppIndex(store.url);
                const j = this.getSubAppIndex(url);
                const direction : Direction = (i < j ? 'forward' : 'back');

                for (const subApp of this.subApps)
                {
                    const {page} = subApp.store;
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

        store.url = url;
        return result;
    }

    /**
     * URLが一致するAppを取得する
     */
    getTargetApp(url : string) : App
    {
        for (const subApp of this.subApps)
        {
            console.log(subApp.url);
            const params = Utils.getParamsFromUrl(url, subApp.url);

            if (params) {
                return subApp;
            }
        }

        for (const subApp of this.subApps)
        {
            const findApp = subApp.getTargetApp(url);

            if (findApp) {
                return findApp;
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
}
