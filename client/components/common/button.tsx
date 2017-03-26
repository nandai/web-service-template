/**
 * (C) 2016-2017 printf.jp
 */
import * as React from 'react';
import R          from 'client/utils/r';

interface ButtonProps
{
    onClick : () => void;
}

export default class Button extends React.Component<ButtonProps, {}>
{
    /**
     * render
     */
    render() : JSX.Element {
        const {props} = this;
        return (
            <button onClick={props.onClick}>
                {props.children}
            </button>
        );
    }
}
