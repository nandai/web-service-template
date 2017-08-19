/**
 * (C) 2016-2017 printf.jp
 */
import bind          from 'bind-decorator';
import * as React    from 'react';
import * as ReactDOM from 'react-dom';

import {BaseStore}   from 'client/components/views/base-store';

interface ViewContainerProps
{
    store   : BaseStore;
    zIndex? : number;
}

export default class ViewContainer extends React.Component<ViewContainerProps, {}>
{
    /**
     * render
     */
    render() : JSX.Element
    {
        const {props} = this;
        const {store, zIndex} = props;
        const {page} = store;
        const {active, displayStatus, direction} = page;
        const effect = page.highPriorityEffect || page.effect || 'fade';
        let className = 'view-container';

             if (displayStatus === 'preparation') {className += ` ${effect} prepare ${direction}`;}
        else if (displayStatus === 'hidden')      {className += ' hidden';}
        else if (active)                          {className += ` ${effect} active`;}
        else                                      {className += ` ${effect} inactive ${direction}`;}

        const style = (zIndex ? {zIndex} : {});
        return (
            <div className={className} style={style} onTransitionEnd={this.onTransitionEnd}>
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
            const {page} = this.props.store;
            page.onPageTransitionEnd(page);
        }
    }
}
