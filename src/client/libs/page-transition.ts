/**
 * (C) 2016-2017 printf.jp
 */
import {App}    from 'client/app/app';
import {pageNS} from 'client/libs/page';
import Utils    from 'client/libs/utils';
import {slog}   from 'libs/slog';

/**
 * ページ遷移
 */
export interface PageTransitionOptions
{
    settings?    : PageTransitionSetting[];
    effectDelay? : number;
}

export default class PageTransition
{
    private apps           : App[];
    private currentApp     : App;       // カレントページのApp
    private nextApp        : App;       // 次にカレントにするページのApp
    private settings       : PageTransitionSetting[];
    private currentSetting : PageTransitionSetting;
    private effectDelay    : number;    // 繊維先ページのエフェクトを開始するまでの遅延時間（デフォルトは0）

    /**
     * @constructor
     */
    constructor(app : App, options : PageTransitionOptions = {})
    {
        this.apps =          [app];
        this.currentApp =     app;
        this.nextApp =        null;
        this.settings =       options.settings || [];
        this.currentSetting = null;
        this.effectDelay =    options.effectDelay || 0;
    }

    /**
     * 次のappを設定する
     */
    setNextApp(nextApp : App) : void
    {
        if (this.currentApp !== nextApp)
        {
            // カレントページを非アクティブ化
            this.currentApp.store.page.active = false;

            // 次のページをアクティブにする準備（この時点では非アクティブ）
            this.apps = this.addOrReplaceApp(nextApp);
            this.nextApp = nextApp;
            this.currentSetting = null;

            // 優先する遷移エフェクトがあればそれを設定する
            const curName =  this.currentApp.toString();
            const nextName = this.nextApp   .toString();

            for (const setting of this.settings)
            {
                if (setting.appName1 === curName && setting.appName2 === nextName)
                {
                    this.currentApp.store.page.highPriorityEffect = setting.effect1;
                    this.nextApp   .store.page.highPriorityEffect = setting.effect2;
                    this.currentSetting =                           setting;
                    break;
                }

                if (setting.appName1 === nextName && setting.appName2 === curName)
                {
                    this.currentApp.store.page.highPriorityEffect = setting.effect2;
                    this.nextApp   .store.page.highPriorityEffect = setting.effect1;
                    this.currentSetting =                           setting;
                    break;
                }
            }

            pageNS.next(this.nextApp.store.page, App.render, this.getEffectDelay());
        }
    }

    /**
     * 次のAppをアクティブにする
     */
    setActiveNextApp() : void
    {
        const app = this.nextApp || this.currentApp;
        app.store.page.active = true;
        app.store.page.displayStatus = 'showing';
    }

    /**
     * displayStatusを変更する
     */
    changeDisplayStatus(page : pageNS.Page) : boolean
    {
        const {active, displayStatus} = page;
        let changed = false;

        if (active)
        {
            if (displayStatus === 'showing')
            {
                const app = this.nextApp || this.currentApp;
                app.store.page.displayStatus = 'displayed';
                changed = true;
            }
        }
        else
        {
            if (displayStatus === 'displayed')
            {
                this.currentApp.store.page.displayStatus = 'hidden';
                this.currentApp = this.nextApp;
                this.nextApp =    null;
                changed = true;
            }
        }

        return changed;
    }

    /**
     * appを追加または置き換える
     */
    private addOrReplaceApp(app : App) : App[]
    {
        const newApps : App[] = Object.assign([], this.apps);
        let exists = false;

        for (let i = 0; i < newApps.length; i++)
        {
            if (newApps[i].toString() === app.toString())
            {
                newApps[i] = app;
                exists = true;
                break;
            }
        }

        if (exists === false) {
            newApps.push(app);
        }

        return newApps;
    }

    /**
     * 繊維先ページのエフェクトを開始するまでの遅延時間を取得する
     * モバイルの場合は最低200ms、それ以外は最低10ms
     */
    getEffectDelay() : number
    {
        const log = slog.stepIn('PageTransition', 'getEffectDelay');
        const {currentSetting} = this;
        let {effectDelay} =  this;

        if (currentSetting && currentSetting.effectDelay !== undefined) {
            effectDelay = currentSetting.effectDelay;
        }

        effectDelay = Math.max(effectDelay, Utils.isMobile() ? 200 : 10);

        log.stepOut();
        return effectDelay;
    }

    /**
     * ページ情報取得
     */
    getPage()
    {
        const log = slog.stepIn('PageTransition', 'getPage');
        const {currentSetting} = this;
        const result =
        {
            elements: this.apps.map((app, i) => app.view(i)),
            bgTheme:  (currentSetting ? currentSetting.bgTheme : null)
        };

        log.stepOut();
        return result;
    }

    /**
     * 遷移中かどうか
     */
    isDuringTransition() : boolean
    {
        const log = slog.stepIn('PageTransition', 'isDuringTransition');
        log.d(this.currentApp.store.page.displayStatus.toString());

        let result = false;
        do
        {
            if (this.nextApp !== null || this.currentApp.store.page.displayStatus !== 'displayed')
            {
                result = true;
                break;
            }

            if (this.currentApp.pageTransition)
            {
                result = this.currentApp.pageTransition.isDuringTransition();
                break;
            }
        }
        while (false);

        log.stepOut();
        return result;
    }
}

/**
 * ページ遷移設定
 * 特定のページ間遷移の場合にデフォルト設定より優先するための設定
 */
export interface PageTransitionSetting
{
    appName1     : string;          // App.toString()で返されるApp名
    appName2     : string;          // 〃
    effect1?     : pageNS.Effect;   // appName1からappName2（またはその逆）へ遷移する場合は
    effect2?     : pageNS.Effect;   // App.store.page.effectより優先されるエフェクト
    effectDelay? : number;          // エフェクト発動までの遅延時間（ms）
    bgTheme?     : 'black';         // バックグラウンドテーマ
}
