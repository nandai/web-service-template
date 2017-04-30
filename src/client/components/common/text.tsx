/**
 * (C) 2016-2017 printf.jp
 */
import * as React from 'react';

export default class Text extends React.Component<{}, {}>
{
    render() : JSX.Element
    {
        return (
            <span className="wst-text">
                {this.props.children}
            </span>
        );
    }
}
