/**
 * (C) 2016-2017 printf.jp
 */
import * as React from 'react';

export default class ViewContents extends React.Component<{}, {}>
{
    /**
     * render
     */
    render() : JSX.Element
    {
        return (
            <div className="view-contents">
                <div className="view-contents-inner">
                    {this.props.children}
                </div>
            </div>
        );
    }
}
