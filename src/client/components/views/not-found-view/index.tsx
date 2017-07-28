/**
 * (C) 2016-2017 printf.jp
 */
import * as React    from 'react';

import Header        from 'client/components/designated/header';
import ViewContainer from 'client/components/views/view-container';
import ViewContents  from 'client/components/views/view-contents';
import {BaseStore}   from '../base-store';

interface NotFoundViewProps
{
    store : BaseStore;
}

export default class NotFoundView extends React.Component<NotFoundViewProps, {}>
{
    /**
     * render
     */
    render() : JSX.Element
    {
        const {store} = this.props;
        return (
            <ViewContainer>
                <Header store={store} />
                <ViewContents>
                    <div className="not-found-view">
                        404 not found.
                    </div>
                </ViewContents>
            </ViewContainer>
        );
    }
}
