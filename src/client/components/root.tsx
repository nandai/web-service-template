/**
 * (C) 2016-2017 printf.jp
 */
import * as React from 'react';

import {App}      from 'client/app/app';
import Apps       from 'client/app/apps';

interface RootProps
{
    apps? : Apps;
    app?  : App;    // SSR用
}

export default class Root extends React.Component<RootProps, {}>
{
    /**
     * render
     */
    render() : JSX.Element
    {
        const {props} = this;
        let {apps} = props;

        if (props.app) {
            apps = new Apps(props.app);
        }

        const elements = apps.createElements();
        return (
            <div className='root' tabIndex={0}>
                {elements}
            </div>
        );
    }
}
