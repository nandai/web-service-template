/**
 * (C) 2016-2017 printf.jp
 */
import * as React from 'react';

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
    render() : JSX.Element
    {
        const {props} = this;
        let {onChange} = props;

        if (onChange === null)
        {
            /**
             * SSR時（onChange未設定時）の下記警告を回避
             *
             * Warning: Failed form propType:
             *   You provided a `value` prop to a form field without an `onChange` handler.
             *   This will render a read-only field.
             *   If the field should be mutable use `defaultValue`.
             *   Otherwise, set either `onChange` or `readOnly`.
             *   Check the render method of `Input`.
             */
            onChange = () => {};
        }

        return (
            <input type =        {props.type}
                   placeholder = {props.placeholder}
                   value =       {props.value ? props.value : ''}
                   onChange =    {onChange} />
        );
    }
}
