/**
 * (C) 2016-2017 printf.jp
 */
import * as React from 'react';

import Button     from 'client/components/common/button';
import Utils      from 'client/libs/utils';

export interface ListItem
{
    id     : number;
    name?  : string;
    title? : string;
}

interface ListProps
{
    url     : string;
    items   : ListItem[];
    height? : string;
    onClick : (id : number) => void;
}

export default class List extends React.Component<ListProps, {}>
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
            const {id} = item;
            const url = Utils.formatString(props.url, {id});
            const name = item.name || item.title;
            return (
                <Button key={i} className="wst-list-item" align="left" margin="0" onClick={() => props.onClick(id)} url={url}>
                    {name}
                </Button>
            );
        });

        let listStyle = {};
        if (props.height) {
            listStyle = {height:props.height};
        }

        return (
            <div className="wst-list" style={listStyle}>
                {elements}
            </div>
        );
    }
}
