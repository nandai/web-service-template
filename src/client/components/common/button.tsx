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
                <div className="wst-button">
                    <a href =    {url}
                       onClick = {onClick}>
                        {children}
                    </a>
                </div>
            );
        }
        else
        {
            el = (
                <button className = "wst-button"
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
}
