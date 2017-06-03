/**
 * (C) 2016-2017 printf.jp
 */
import * as React from 'react';

interface InputProps
{
    type?        : string;
    placeholder? : string;
    value        : string;
    onChange     : (value : string) => void;
}

export default class Input extends React.Component<InputProps, {}>
{
    private static defaultProps : InputProps = {
        type:        'text',
        placeholder: '',
        value:       '',
        onChange:    () => {}
    };

    /**
     * render
     */
    render() : JSX.Element
    {
        const {props} = this;

        return (
            <input className =   "wst-input"
                   type =        {props.type}
                   placeholder = {props.placeholder}
                   value =       {props.value ? props.value : ''}
                   onChange =    {(e) => props.onChange(e.target.value)} />
        );
    }
}
