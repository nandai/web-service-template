/**
 * (C) 2016-2017 printf.jp
 */
import {App} from 'client/app/app';

export default class Apps
{
    apps?       : App[];
    currentApp? : App;
    nextApp?    : App;

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
            this.apps = this.addOrReplaceApp(nextApp);
            this.nextApp = nextApp;
        }
    }

    /**
     * 次のappをカレントにする
     */
    changeCurrentApp()
    {
        if (this.nextApp)
        {
            this.currentApp.store.displayStatus = 'hidden';

            this.nextApp.store.active = true;
            this.nextApp.store.displayStatus = 'showing';

            this.currentApp = this.nextApp;
            this.nextApp =    null;
        }
    }

    /**
     * Appを追加または置き換え
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
}
