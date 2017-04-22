/**
 * (C) 2016-2017 printf.jp
 */
import * as React from 'react';

export default class Main extends React.Component<{}, {}>
{
    /**
     * render
     */
    render() : JSX.Element
    {
        return (
            <div className="wst-main" tabIndex={0}>
                {this.props.children}
            </div>
        );
    }
}
