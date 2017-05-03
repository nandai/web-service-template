/**
 * (C) 2016-2017 printf.jp
 */
import * as React from 'react';

export default class ViewContainer extends React.Component<{}, {}>
{
    /**
     * render
     */
    render() : JSX.Element
    {
        return (
            <div className="view-container">
                {this.props.children}
            </div>
        );
    }
}
