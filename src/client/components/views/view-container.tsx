/**
 * (C) 2016-2017 printf.jp
 */
import bind          from 'bind-decorator';
import * as React    from 'react';
import * as ReactDOM from 'react-dom';

import {pageNS}      from 'client/libs/page';

interface ViewContainerProps
{
    page    : pageNS.Page;
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
        const {page, zIndex} = props;
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
            const {page} = this.props;
            page.onPageTransitionEnd(page);
        }
    }
}
