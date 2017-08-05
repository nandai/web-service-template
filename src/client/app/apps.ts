/**
 * (C) 2016-2017 printf.jp
 */
import {App} from 'client/app/app';

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

            this.nextApp.store.active = true;
            this.nextApp.store.displayStatus = 'showing';

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
