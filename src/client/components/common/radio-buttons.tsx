/**
 * (C) 2016-2017 printf.jp
 */
import * as React from 'react';

export interface RadioButtonItem
{
    label : string;
    value : any;
}

interface RadioButtonsProps
{
    name    : string;
    items   : RadioButtonItem[];
    value   : any;
    onClick : (value) => void;
}

export default class RadioButtons extends React.Component<RadioButtonsProps, {}>
{
    /**
     * render
     */
    render() : JSX.Element
    {
        const {props} = this;
        const {items} = props;

        const elements = items.map((item, i) =>
        {
            const checked = (item.value === props.value);
            const id = `name-${i + 1}`;

            return (
                <div key={i} className="wst-radio-button-outer">
                    <input className="wst-radio-button" type="radio" id={id} name={props.name} checked={checked} onChange={() => props.onClick(item.value)} />
                    <label htmlFor={id}>{item.label}</label>
                </div>
            );
        });

        return (
            <div>
                {elements}
            </div>
        );
    }
}
