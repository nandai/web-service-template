/**
 * (C) 2016-2017 printf.jp
 */
import * as React      from 'react';

import {BaseStore}     from 'client/components/views/base-store';
import ViewContainer   from 'client/components/views/view-container';
import ViewContents    from 'client/components/views/view-contents';

interface AboutViewProps
{
    store : BaseStore;
}

export default class AboutView extends React.Component<AboutViewProps, {}>
{
    /**
     * render
     */
    render() : JSX.Element
    {
        const {store} = this.props;
        return (
            <ViewContainer store={store}>
                <ViewContents>
                    <p style={{textAlign:'center'}}>
                        <a href="https://github.com/nandai/web-service-template" target="_blank">https://github.com/nandai/web-service-template</a>
                    </p>
                </ViewContents>
            </ViewContainer>
        );
    }
}
