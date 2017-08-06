/**
 * (C) 2016-2017 printf.jp
 */
import bind          from 'bind-decorator';
import * as React    from 'react';
import * as ReactDOM from 'react-dom';

import {BaseStore}   from 'client/components/views/base-store';

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
        const {active, displayStatus, direction} = store;
        const effect = store.highPriorityEffect || store.effect || 'fade';
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
            const {store} = this.props;
            const {active, displayStatus} = store;

            if (active)
            {
                if (displayStatus === 'showing') {
                    store.onPageTransitionEnd();
                }
            }
            else
            {
                if (displayStatus === 'displayed') {
                    store.onPageTransitionEnd();
                }
            }
        }
    }
}
