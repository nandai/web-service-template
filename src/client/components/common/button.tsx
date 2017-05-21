/**
 * (C) 2016-2017 printf.jp
 */
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
    private static defaultProps : ButtonProps =
    {
        className: null,
        url:       null,
        submit:    false,
        disabled:  false,
        align:     null,
        margin:    null,
        onClick:   null
    };

    constructor(props : ButtonProps)
    {
        super(props);
        this.onClick = this.onClick.bind(this);
        this.onKeyUp = this.onKeyUp.bind(this);
    }

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
                <div className={className} style={style} tabIndex={0} onKeyUp={this.onKeyUp}>
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
                <button className = {className}
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
    private onClick(e : React.MouseEvent<Element>)
    {
        e.preventDefault();
        this.props.onClick();
    }

    /**
     * keyup event
     */
    private onKeyUp(e : React.KeyboardEvent<Element>)
    {
        if (e.keyCode === 0x20 || e.keyCode === 0x0D) {
            this.props.onClick();
        }
    }
}
