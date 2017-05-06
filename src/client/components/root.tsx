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
    view     : JSX.Element;
    nextView : JSX.Element;
    fade     : boolean;
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
            view:     props.view,
            nextView: null,
            fade:     false
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

        return (
            <div className="root" tabIndex={0}>
                <div className={className} ref="root" onTransitionEnd={this.onTransitionEnd}>
                    {this.state.view}
                </div>
            </div>
        );
    }

    /**
     * componentWillReceiveProps
     */
    componentWillReceiveProps(nextProps : RootProps)
    {
        if (this.state.view.type === nextProps.view.type || nextProps.effect === undefined || nextProps.effect === 'none')
        {
            this.setState({view:nextProps.view});
        }
        else
        {
            const state =
            {
                nextView: nextProps.view,
                fade:     true
            };
            this.setState(state);
        }
    }

    /**
     * onTransitionEnd
     */
    onTransitionEnd(e : React.TransitionEvent<Element>)
    {
        const el = ReactDOM.findDOMNode(this.refs['root']);

        if (el === e.target && this.state.nextView)
        {
            const state =
            {
                view:     this.state.nextView,
                nextView: null
            };
            this.setState(state);

            setTimeout(() => this.setState({fade:false}), 0);
        }
    }
}
