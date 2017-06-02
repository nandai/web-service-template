/**
 * (C) 2016-2017 printf.jp
 */
import * as React  from 'react';

import Button      from 'client/components/common/button';
import CommonUtils from 'libs/utils';

export interface ListItem
{
    id   : number;
    text : string;
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
            const url = CommonUtils.formatString(props.url, {id});
            return (
                <Button key={i} className="wst-list-item" align="left" margin="0" onClick={() => props.onClick(id)} url={url}>
                    {item.text}
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
