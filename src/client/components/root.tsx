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

        const page = apps.getPage();
        let bgClassName = 'root-background';

        switch (page.bgTheme)
        {
        case 'black':
            bgClassName += ' black';
            break;
        }

        return (
            <div className='root' tabIndex={0}>
                <div className={bgClassName}>
                    <div>web service template</div>
                </div>
                {page.elements}
            </div>
        );
    }
}
