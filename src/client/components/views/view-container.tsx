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
        const {store} = props;
        const {active, displayStatus, effect, direction} = store;
        let className = 'view-container';

             if (displayStatus === 'preparation') {className += ` ${effect} prepare ${direction}`;}
        else if (displayStatus === 'hidden')      {className += ' hidden';}
        else if (active)                          {className += ` ${effect} active`;}
        else                                      {className += ` ${effect} inactive ${direction}`;}

        return (
            <div className={className} onTransitionEnd={this.onTransitionEnd}>
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
