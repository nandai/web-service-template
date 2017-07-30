/**
 * (C) 2016-2017 printf.jp
 */
import * as React from 'react';

interface ViewContainerProps
{
    active : boolean;
}

export default class ViewContainer extends React.Component<ViewContainerProps, {}>
{
    /**
     * render
     */
    render() : JSX.Element
    {
        const {props} = this;
        const style = {display: props.active ? 'flex' : 'none'};

        return (
            <div className="view-container" style={style}>
                {props.children}
            </div>
        );
    }
}
