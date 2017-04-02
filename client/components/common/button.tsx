/**
 * (C) 2016-2017 printf.jp
 */
import * as React from 'react';

interface ButtonProps
{
    disabled? : boolean;
    onClick   : () => void;
}

export default class Button extends React.Component<ButtonProps, {}>
{
    private static defaultProps : ButtonProps = {
        disabled: false,
        onClick:  null
    };

    /**
     * render
     */
    render() : JSX.Element {
        const {props} = this;
        return (
            <button disabled={props.disabled}
                    onClick={props.onClick}>
                {props.children}
            </button>
        );
    }
}
