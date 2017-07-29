/**
 * (C) 2016-2017 printf.jp
 */
import bind          from 'bind-decorator';
import * as React    from 'react';
import * as ReactDOM from 'react-dom';

import {App}         from 'client/app/app';

interface RootProps
{
    app     : App;
    effect? : string;
}

interface RootState
{
    apps?       : App[];
    currentApp? : App;
    nextApp?    : App;
    fade?       : boolean;
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
            nextApp:    null,
            fade:       false
        };
    }

    /**
     * render
     */
    render() : JSX.Element
    {
        const {state} = this;
        let className = 'root-transition';

        if (state.fade) {
            className += ' fade';
        }

        // スクロール位置を保持するため、非アクティブなビューは破棄せず非表示にしておく
        const elements = state.apps.map((app, i) =>
        {
            const style =
            {
                display: (app.toString() === state.currentApp.toString() ? 'flex' : 'none'),
                flexGrow: 1
            };
            return <div key={i} style={style}>{app.view()}</div>;
        });

        return (
            <div className="root" tabIndex={0}>
                 <div className={className} ref="root" onTransitionEnd={this.onTransitionEnd}>
                    {elements}
                 </div>
            </div>
        );
    }

    /**
     * componentWillReceiveProps
     */
    componentWillReceiveProps(nextProps : RootProps)
    {
        if (this.state.currentApp.toString() === nextProps.app.toString() || nextProps.effect === undefined || nextProps.effect === 'none')
        {
            const newApps = this.addOrReplaceApp(nextProps.app);
            const newState : RootState =
            {
                apps:       newApps,
                currentApp: nextProps.app
            };
            this.setState(newState);
        }
        else
        {
            const newState : RootState =
            {
                nextApp: nextProps.app,
                fade:    true
            };
            this.setState(newState);
        }
    }

    /**
     * onTransitionEnd
     */
    @bind
    onTransitionEnd(e : React.TransitionEvent<Element>)
    {
        const {state} = this;
        const el = ReactDOM.findDOMNode(this.refs['root']);

        if (el === e.target && state.nextApp)
        {
            const newApps = this.addOrReplaceApp(state.nextApp);
            const newState : RootState =
            {
                apps:       newApps,
                currentApp: state.nextApp,
                nextApp:    null
            };
            this.setState(newState);

            // ワンテンポずらす（そうしないとエフェクトが発動しないため）
            setTimeout(() => this.setState({fade:false}), 0);
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
