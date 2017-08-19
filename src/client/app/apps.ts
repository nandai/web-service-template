/**
 * (C) 2016-2017 printf.jp
 */
import {App}    from 'client/app/app';
import {pageNS} from 'client/libs/page';
import Utils    from 'client/libs/utils';

export default class Apps
{
    private apps        : App[];
    private currentApp  : App;
    private nextApp     : App;
    private transitions : AppTransition[];
    private transition  : AppTransition;
    private effectDelay : number;

    /**
     * @constructor
     */
    constructor(app : App, options : {transitions? : AppTransition[], effectDelay? : number} = {})
    {
        this.apps =       [app];
        this.currentApp =  app;
        this.nextApp =     null;
        this.transitions = options.transitions || [];
        this.transition =  null;
        this.effectDelay = options.effectDelay || 0;
    }

    /**
     * 次のappを設定する
     */
    setNextApp(nextApp : App) : void
    {
        if (this.currentApp !== nextApp)
        {
            // 非アクティブ化
            this.currentApp.store.page.active = false;

            // アクティブ化準備
            this.apps = this.addOrReplaceApp(nextApp);
            this.nextApp = nextApp;
            this.nextApp.store.page.active = false;
            this.nextApp.store.page.displayStatus = 'preparation';
            this.transition = null;

            // 優先する遷移エフェクトがあれば設定
            const curName =  this.currentApp.toString();
            const nextName = this.nextApp   .toString();

            for (const transition of this.transitions)
            {
                if (transition.appName1 === curName && transition.appName2 === nextName)
                {
                    this.currentApp.store.page.highPriorityEffect = transition.effect1;
                    this.nextApp   .store.page.highPriorityEffect = transition.effect2;
                    this.transition =                               transition;
                    break;
                }

                if (transition.appName1 === nextName && transition.appName2 === curName)
                {
                    this.currentApp.store.page.highPriorityEffect = transition.effect2;
                    this.nextApp   .store.page.highPriorityEffect = transition.effect1;
                    this.transition =                               transition;
                    break;
                }
            }
        }
    }

    /**
     * 次のappをアクティブにする
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
     * effect delayを取得する
     */
    getEffectDelay() : number
    {
        const {transition} = this;
        let {effectDelay} =  this;

        if (transition && transition.effectDelay !== undefined) {
            effectDelay = transition.effectDelay;
        }

        return Math.max(effectDelay, Utils.isMobile() ? 200 : 10);
    }

    /**
     * ページ情報取得
     */
    getPage()
    {
        const {transition} = this;
        return {
            elements: this.apps.map((app, i) => app.view(i)),
            bgTheme:  (transition ? transition.bgTheme : null)
        };
    }

    /**
     * 遷移中かどうか
     */
    isDuringTransition() : boolean
    {
        if (this.nextApp !== null || this.currentApp.store.page.displayStatus !== 'displayed') {
            return true;
        }

        if (this.currentApp.apps) {
            return this.currentApp.apps.isDuringTransition();
        }

        return false;
    }
}

export interface AppTransition
{
    appName1     : string;
    appName2     : string;
    effect1?     : pageNS.Effect;
    effect2?     : pageNS.Effect;
    effectDelay? : number;
    bgTheme?     : string;
}
