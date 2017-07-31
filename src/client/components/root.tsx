/**
 * (C) 2016-2017 printf.jp
 */
import bind       from 'bind-decorator';
import * as React from 'react';

import {App}      from 'client/app/app';

interface RootProps
{
    app          : App;
    onActiveApp? : (app : App) => void;
}

interface RootState
{
    apps?       : App[];
    currentApp? : App;
    nextApp?    : App;
}

export default class Root extends React.Component<RootProps, RootState>
{
    /**
     * @constructor
     */
    constructor(props : RootProps)
    {
        super(props);

        this.state =
        {
            apps:      [props.app],
            currentApp: props.app,
            nextApp:    null
        };
    }

    /**
     * render
     */
    render() : JSX.Element
    {
        const {state} = this;
        const elements = state.apps.map((app, i) =>
        {
            app.store.onTransitionEnd = this.onTransitionEnd;   // TODO:仮
            return app.view(i);
        });

        return (
            <div className='root' tabIndex={0}>
                {elements}
            </div>
        );
    }

    /**
     * componentWillReceiveProps
     */
    componentWillReceiveProps(nextProps : RootProps)
    {
        const nextApp = nextProps.app;
        const apps = this.addOrReplaceApp(nextApp);
        const newState : RootState = {apps, nextApp};
        this.setState(newState);
    }

    /**
     * onTransitionEnd
     */
    @bind
    onTransitionEnd()
    {
        const {state} = this;
        const {nextApp} = state;

        if (nextApp)
        {
            this.props.onActiveApp(nextApp);
            const newState : RootState =
            {
                currentApp: nextApp,
                nextApp:    null
            };
            this.setState(newState);
        }
    }

    /**
     * Appを追加または置き換え
     */
    private addOrReplaceApp(addApp : App) : App[]
    {
        const {state} = this;
        const newApps : App[] = Object.assign([], state.apps);
        let exists = false;

        for (let i = 0; i < newApps.length; i++)
        {
            if (newApps[i].toString() === addApp.toString())
            {
                newApps[i] = addApp;
                exists = true;
                break;
            }
        }

        if (exists === false) {
            newApps.push(addApp);
        }

        return newApps;
    }
}
