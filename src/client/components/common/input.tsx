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
    onChange     : (value : string) => void;
}

export default class Input extends React.Component<InputProps, {}>
{
    private static defaultProps : InputProps = {
        type:        'text',
        placeholder: '',
        value:       '',
        message:     '',
        onChange:    () => {}
    };

    /**
     * render
     */
    render() : JSX.Element
    {
        const {props} = this;

        return (
            <div>
                <input className =   "wst-input"
                       type =        {props.type}
                       placeholder = {props.placeholder}
                       value =       {props.value || ''}
                       onChange =    {(e) => props.onChange(e.target.value)} />
                <Text className="wst-input-error">{props.message}</Text>
            </div>
        );
    }
}
