/**
 * (C) 2016-2017 printf.jp
 */
import * as React    from 'react';

import Header        from 'client/components/designated/header';
import ViewContainer from 'client/components/views/view-container';
import ViewContents  from 'client/components/views/view-contents';
import {BaseStore}   from '../base-store';

interface ForbiddenViewProps
{
    store : BaseStore;
}

export default class ForbiddenView extends React.Component<ForbiddenViewProps, {}>
{
    /**
     * render
     */
    render() : JSX.Element
    {
        const {store} = this.props;
        return (
            <ViewContainer page={store.page}>
                <Header store={store} />
                <ViewContents>
                    <div className="forbidden-view">
                        403 forbidden.
                    </div>
                </ViewContents>
            </ViewContainer>
        );
    }
}
