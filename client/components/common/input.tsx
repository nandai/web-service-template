/**
 * (C) 2016-2017 printf.jp
 */
import * as React from 'react';
import R          from 'client/utils/r';

interface InputProps
{
    type?        : string;
    placeholder? : string;
    value        : string;
    onChange     : (e : React.ChangeEvent<HTMLInputElement>) => void;
}

export default class Input extends React.Component<InputProps, {}>
{
    private static defaultProps : InputProps = {
        type:        'text',
        placeholder: '',
        value:       '',
        onChange:    null
    };

    /**
     * render
     */
    render() : JSX.Element {
        const {props} = this;
        return (
            <input type =        {props.type}
                   placeholder = {props.placeholder}
                   value =       {props.value}
                   onChange =    {props.onChange} />
        );
    }
}
