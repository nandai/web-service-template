/**
 * (C) 2016-2017 printf.jp
 */
import bind       from 'bind-decorator';
import * as React from 'react';

import {App}      from 'client/app/app';
import Apps       from 'client/app/apps';

interface RootProps
{
    app : App;
}

export default class Root extends React.Component<RootProps, {}>
{
    apps : Apps;

    /**
     * @constructor
     */
    constructor(props : RootProps)
    {
        super(props);
        this.apps = new Apps(props.app);
    }

    /**
     * render
     */
    render() : JSX.Element
    {
        const elements = this.apps.apps.map((app, i) =>
        {
            app.store.onTransitionEnd = this.onTransitionEnd;   // TODO:仮
            return app.view(i);
        });

        return (
            <div className='root' tabIndex={0}>
                {elements}
            </div>
        );
    }

    /**
     * componentWillReceiveProps
     */
    componentWillReceiveProps(nextProps : RootProps)
    {
        this.apps.setNextApp(nextProps.app);
    }

    /**
     * onTransitionEnd
     */
    @bind
    onTransitionEnd()
    {
        this.apps.changeCurrentApp();
        this.setState({});
    }
}
