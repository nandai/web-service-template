/**
 * (C) 2016-2017 printf.jp
 */
import {App}               from 'client/app/app';
import {BaseStore, Effect} from 'client/components/views/base-store';

export default class Apps
{
    private apps       : App[];
    private currentApp : App;
    private nextApp    : App;
    private transition : Transition;

    /**
     * @constructor
     */
    constructor(app : App)
    {
        this.apps =      [app];
        this.currentApp = app;
        this.nextApp =    null;
        this.transition = null;
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

            for (const transition of transitions)
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
    changeDisplayStatus(store : BaseStore) : boolean
    {
        const {active, displayStatus} = store.page;
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
     * 次のappのeffect delayを取得する
     */
    getEffectDelay() : number
    {
        const {transition} = this;
        let effectDelay = 500;

        if (transition && transition.effectDelay !== undefined) {
            effectDelay = transition.effectDelay;
        }

        return Math.max(effectDelay, 10);
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
        if (this.nextApp === null && this.currentApp.store.page.displayStatus === 'displayed') {
            return false;
        }
        return true;
    }
}

interface Transition
{
    appName1     : string;
    appName2     : string;
    effect1?     : Effect;
    effect2?     : Effect;
    effectDelay? : number;
    bgTheme?     : string;
}

const transitions : Transition[] =
[
    {
        appName1:    'LoginApp',
        appName2:    'UsersApp',
        effect1:     'slide',
        effect2:     'slide'
    },

    {
        appName1:    'LoginApp',
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
