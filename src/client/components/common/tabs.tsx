/**
 * (C) 2016-2017 printf.jp
 */
import Button     from 'client/components/common/button';
import * as React from 'react';

export interface TabItem
{
    name    : string;
    label   : string;
    onClick : () => void;
}

interface TabsProps
{
    active : string;
    items  : TabItem[];
}

export default class Tabs extends React.Component<TabsProps, {}>
{
    /**
     * render
     */
    render() : JSX.Element
    {
        const {props} = this;
        const {items} = props;
        let index = 0;

        const elements = items.map((item, i) =>
        {
            if (item.name === props.active) {
                index = i;
            }

            return (
                <div key={i} className="wst-tab">
                    <Button margin="0" onClick={item.onClick}>{item.label}</Button>
                </div>
            );
        });

        const count = items.length;
        const left =  `${100 / count * index}%`;
        const width = `${100 / count}%`;
        const style = {left, width};

        return (
            <div className="wst-tabs">
                {elements}
                <div className="wst-tab-active" style={style} />
            </div>
        );
    }
}
