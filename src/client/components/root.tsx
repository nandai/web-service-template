/**
 * (C) 2016-2017 printf.jp
 */
import * as React    from 'react';
import * as ReactDOM from 'react-dom';

interface RootProps
{
    view    : JSX.Element;
    effect? : string;
}

interface RootState
{
    views?       : JSX.Element[];
    currentView? : JSX.Element;
    nextView?    : JSX.Element;
    fade?        : boolean;
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
            views:      [props.view],
            currentView: props.view,
            nextView:    null,
            fade:        false
        };

        this.onTransitionEnd = this.onTransitionEnd.bind(this);
    }

    /**
     * render
     */
    render() : JSX.Element
    {
        const {state} = this;
        let className = 'root-transition';

        if (state.fade)
            className += ' fade';

        // スクロール位置を保持するため、非アクティブなビューは破棄せず非表示にしておく
        const elements = state.views.map((view, i) =>
        {
            const style =
            {
                display: (view.type === state.currentView.type ? 'flex' : 'none'),
                flexGrow: 1
            };
            return <div key={i} style={style}>{view}</div>
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
        if (this.state.currentView.type === nextProps.view.type || nextProps.effect === undefined || nextProps.effect === 'none')
        {
            const newViews = this.addOrReplaceView(nextProps.view);
            const newState : RootState =
            {
                views:       newViews,
                currentView: nextProps.view
            };
            this.setState(newState);
        }
        else
        {
            const newState : RootState =
            {
                nextView: nextProps.view,
                fade:     true
            };
            this.setState(newState);
        }
    }

    /**
     * onTransitionEnd
     */
    onTransitionEnd(e : React.TransitionEvent<Element>)
    {
        const {state} = this;
        const {views} = state;
        const el = ReactDOM.findDOMNode(this.refs['root']);

        if (el === e.target && state.nextView)
        {
            const newViews = this.addOrReplaceView(state.nextView);
            const newState : RootState =
            {
                views:       newViews,
                currentView: state.nextView,
                nextView:    null
            };
            this.setState(newState);

            // ワンテンポずらす（そうしないとエフェクトが発動しないため）
            setTimeout(() => this.setState({fade:false}), 0);
        }
    }

    /**
     * ビューを追加または置き換え
     */
    private addOrReplaceView(addView : JSX.Element) : JSX.Element[]
    {
        const {state} = this;
        const newViews = Object.assign([], state.views);
        let exists = false;

        for (let i = 0; i < newViews.length; i++)
        {
            if (newViews[i].type === addView.type)
            {
                newViews[i] = addView;
                exists = true;
                break;
            }
        }

        if (exists === false)
            newViews.push(addView);

        return newViews;
    }
}
