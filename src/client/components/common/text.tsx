/**
 * (C) 2016-2017 printf.jp
 */
import * as React from 'react';

interface TextProps
{
    className? : string;
    error?     : boolean;
}

export default class Text extends React.Component<TextProps, {}>
{
    render() : JSX.Element
    {
        const {props} = this;

        let className = 'wst-text';
        if (props.error)     {className += ' wst-text-error';}
        if (props.className) {className += ` ${props.className}`;}

        return (
            <span className={className}>
                {props.children}
            </span>
        );
    }
}
