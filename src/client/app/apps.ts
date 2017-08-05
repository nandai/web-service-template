/**
 * (C) 2016-2017 printf.jp
 */
import {App}    from 'client/app/app';
import {Effect} from 'client/components/views/base-store';

export default class Apps
{
    private apps?       : App[];
    private currentApp? : App;
    private nextApp?    : App;

    /**
     * @constructor
     */
    constructor(app : App)
    {
        this.apps =      [app];
        this.currentApp = app;
        this.nextApp =    null;
    }

    /**
     * 次のappを設定する
     */
    setNextApp(nextApp : App)
    {
        if (this.currentApp !== nextApp)
        {
            // 非アクティブ化
            this.currentApp.store.active = false;

            // アクティブ化準備
            this.apps = this.addOrReplaceApp(nextApp);
            this.nextApp = nextApp;
            this.nextApp.store.active = false;
            this.nextApp.store.displayStatus = 'preparation';

            // 優先する遷移エフェクトがあれば設定
            const curName =  this.currentApp.toString();
            const nextName = this.nextApp   .toString();

            for (const transition of transitions)
            {
                if ((transition.appName1 === curName  && transition.appName2 === nextName)
                ||  (transition.appName1 === nextName && transition.appName2 === curName))
                {
                    this.currentApp.store.highPriorityEffect = transition.effect1;
                    this.nextApp   .store.highPriorityEffect = transition.effect2;
                    break;
                }
            }
        }
    }

    /**
     * 次のappをカレントにする
     */
    changeCurrentApp() : boolean
    {
        const changed = (this.nextApp !== null);
        if (this.nextApp)
        {
            this.currentApp.store.displayStatus = 'hidden';
            this.currentApp.store.highPriorityEffect = null;

            this.nextApp.store.active = true;
            this.nextApp.store.displayStatus = 'showing';
            this.nextApp.store.highPriorityEffect = null;

            this.currentApp = this.nextApp;
            this.nextApp =    null;
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
     * DOM生成
     */
    createElements()
    {
        return this.apps.map((app, i) => app.view(i));
    }
}

interface Transition
{
    appName1 : string;
    appName2 : string;
    effect1  : Effect;
    effect2  : Effect;
}

const transitions : Transition[] =
[
    {appName1:'LoginApp', appName2:'UsersApp',    effect1:'slide', effect2:'slide'},
    {appName1:'TopApp',   appName2:'SettingsApp', effect1:'slide', effect2:'slide'}
];
