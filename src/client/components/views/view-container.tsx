/**
 * (C) 2016-2017 printf.jp
 */
import bind          from 'bind-decorator';
import * as React    from 'react';
import * as ReactDOM from 'react-dom';

import {BaseStore}   from 'client/components/views/base-store';
import {slog}        from 'libs/slog';

interface ViewContainerProps
{
    store : BaseStore;
}

export default class ViewContainer extends React.Component<ViewContainerProps, {}>
{
    /**
     * render
     */
    render() : JSX.Element
    {
        const {props} = this;
        let style = {};

        if (props.store.active)
        {
            style =
            {
                display: 'flex',
                opacity: 1,
                zIndex:  1
            };
        }
        else
        {
            style =
            {
                display: 'flex',
                opacity: 0,
                zIndex:  0
            };
        }

        return (
            <div className="view-container" style={style} onTransitionEnd={this.onTransitionEnd}>
                {props.children}
            </div>
        );
    }

    /**
     * onTransitionEnd
     */
    @bind
    onTransitionEnd(e : React.TransitionEvent<Element>)
    {
        const el = ReactDOM.findDOMNode(this);
        if (el === e.target)
        {
            const log = slog.stepIn('ViewContainer', 'onTransitionEnd');
            this.props.store.onTransitionEnd();
            log.stepOut();
        }
    }
}
