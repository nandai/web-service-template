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
    isMarginTop? : boolean;
    onChange     : (value : string) => void;
}

export default class Input extends React.Component<InputProps, {}>
{
    static defaultProps : InputProps = {
        type:        'text',
        placeholder: '',
        value:       '',
        message:     '',
        error:       true,
        isMarginTop: false,
        onChange:    () => {}
    };

    /**
     * render
     */
    render() : JSX.Element
    {
        const {props} = this;
        const style = (props.isMarginTop
            ? {marginTop:'48px'}
            : {});

        const textClassName = (props.error
            ? 'wst-input-error'
            : 'wst-input-ok');

        return (
            <div style={style}>
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
