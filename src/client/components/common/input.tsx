/**
 * (C) 2016-2017 printf.jp
 */
import * as React from 'react';

import Text       from 'client/components/common/text';

interface InputProps
{
    type?        : string;
    placeholder? : string;
    value        : string;
    message?     : string;
    error?       : boolean;
    onChange     : (value : string) => void;
}

export default class Input extends React.Component<InputProps, {}>
{
    private static defaultProps : InputProps = {
        type:        'text',
        placeholder: '',
        value:       '',
        message:     '',
        error:       true,
        onChange:    () => {}
    };

    /**
     * render
     */
    render() : JSX.Element
    {
        const {props} = this;
        const textClassName = (props.error
            ? 'wst-input-error'
            : 'wst-input-ok');

        return (
            <div>
                <input className =   "wst-input"
                       type =        {props.type}
                       placeholder = {props.placeholder}
                       value =       {props.value || ''}
                       onChange =    {(e) => props.onChange(e.target.value)} />
                <Text className={textClassName}>{props.message}</Text>
            </div>
        );
    }
}
