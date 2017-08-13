/**
 * (C) 2016-2017 printf.jp
 */
import bind       from 'bind-decorator';
import * as React from 'react';

interface ButtonProps
{
    className? : string;
    url?       : string;
    submit?    : boolean;
    disabled?  : boolean;
    align?     : string;
    margin?    : string;
    onClick    : () => void;
}

export default class Button extends React.Component<ButtonProps, {}>
{
    static noReaction = false;
    static defaultProps : ButtonProps =
    {
        className: null,
        url:       null,
        submit:    false,
        disabled:  false,
        align:     null,
        margin:    null,
        onClick:   null
    };

    /**
     * render
     */
    render() : JSX.Element
    {
        const {props, onClick} = this;
        const {url, submit, disabled, align, margin, children} = props;

        let className = 'wst-button';

        if (align) {
            className += ' wst-button-' + align;
        }

        if (props.className) {
            className += ' ' + props.className;
        }

        const style = (margin ? {margin} : {});
        let el : JSX.Element;

        if (disabled === false && url)
        {
            el = (
                <div className={className} style={style}>
                    <a tabIndex = {-1}
                       href =     {url}
                       onClick =  {onClick}>
                        {children}
                    </a>
                </div>
            );
        }
        else
        {
            const type = (submit ? 'submit' : 'button');
            el = (
                <button tabIndex=   {-1}
                        className = {className}
                        style=      {style}
                        type =      {type}
                        disabled =  {disabled}
                        onClick  =  {onClick}>
                    {children}
                </button>
            );
        }

        return el;
    }

    /**
     * click event
     */
    @bind
    private onClick(e : React.MouseEvent<Element>)
    {
        e.preventDefault();
        document.body.focus();

        if (Button.noReaction === false)
        {
            Button.noReaction = true;
            this.props.onClick();
        }
    }
}
