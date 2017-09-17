/**
 * (C) 2016-2017 printf.jp
 */
import bind          from 'bind-decorator';
import * as React    from 'react';
import * as ReactDOM from 'react-dom';

import History       from 'client/libs/history';
import {pageNS}      from 'client/libs/page';

interface ViewContainerProps
{
    page             : pageNS.Page;
    zIndex?          : number;
    backgroundColor? : string;
}

export default class ViewContainer extends React.Component<ViewContainerProps, {}>
{
    private touchY = 0;

    /**
     * render
     */
    render() : JSX.Element
    {
        const {props} = this;
        const {page, zIndex, backgroundColor} = props;
        const {active, displayStatus} = page;
        const direction = History.direction;
        const effect = page.highPriorityEffect || page.effect || 'fade';
        let className = 'view-container';

             if (displayStatus === 'preparation') {className += ` ${effect} prepare ${direction}`;}
        else if (displayStatus === 'hidden')      {className += ' hidden';}
        else if (active)                          {className += ` ${effect} active`;}
        else                                      {className += ` ${effect} inactive ${direction}`;}

        const style = {zIndex, backgroundColor};
        return (
            <div className =       {className}
                 style =           {style}
                 onTransitionEnd = {this.onTransitionEnd}
                 onTouchStart =    {this.onTouchStart}
                 onTouchMove =     {this.onTouchMove}>
                {props.children}
            </div>
        );
    }

    /**
     * transitionend event
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

    /**
     * touchstart event
     */
    @bind
    private onTouchStart(e : React.TouchEvent<Element>)
    {
        this.touchY = e.touches[0].screenY;
    }

    /**
     * touchmove event
     */
    @bind
    private onTouchMove(e : React.TouchEvent<Element>)
    {
        const thisEl = ReactDOM.findDOMNode(this);
        let el = e.target as HTMLElement;
        const moveY = e.touches[0].screenY;
        let noScroll = true;

        if (el.nodeName === 'INPUT' && (el as HTMLInputElement).type === 'range') {
            return;
        }

        while (el !== thisEl)
        {
            if (el.offsetHeight < el.scrollHeight)
            {
                if (this.touchY < moveY && el.scrollTop === 0) {
                    break;
                }

                if (this.touchY > moveY && el.scrollTop === el.scrollHeight - el.offsetHeight) {
                    break;
                }

                noScroll = false;
                break;
            }
            el = el.parentElement;
        }

        if (noScroll) {
            e.preventDefault();
        }

        this.touchY = moveY;
    }
}
