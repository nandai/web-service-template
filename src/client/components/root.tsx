/**
 * (C) 2016-2017 printf.jp
 */
import * as React    from 'react';
import * as ReactDOM from 'react-dom';
import Main          from 'client/components/designated/main';

interface RootProps
{
    view : JSX.Element;
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
        let className = 'root';

        if (state.fade)
            className += ' fade';

        return (
            <Main>
                <div className={className} ref="root" onTransitionEnd={this.onTransitionEnd}>
                    {this.state.view}
                </div>
            </Main>
        );
    }

    /**
     * componentWillReceiveProps
     */
    componentWillReceiveProps(nextProps : RootProps)
    {
        const state =
        {
            nextView: nextProps.view,
            fade:     true
        };
        this.setState(state);
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
