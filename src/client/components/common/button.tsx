/**
 * (C) 2016-2017 printf.jp
 */
import * as React from 'react';

interface ButtonProps
{
    url?      : string;
    disabled? : boolean;
    onClick   : () => void;
}

export default class Button extends React.Component<ButtonProps, {}>
{
    private static defaultProps : ButtonProps = {
        url:      null,
        disabled: false,
        onClick:  null
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
        const {url, disabled, children} = props;
        let el : JSX.Element;

        if (disabled === false && url)
        {
            el = (
                <div className="wst-button" tabIndex={0} onKeyUp={this.onKeyUp}>
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
            el = (
                <button className = "wst-button"
                        type =      "button"
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
        if (e.keyCode === 0x20 || e.keyCode === 0x0D)
            this.props.onClick();
    }
}
