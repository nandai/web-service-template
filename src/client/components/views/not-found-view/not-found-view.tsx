/**
 * (C) 2016-2017 printf.jp
 */
import * as React    from 'react';

import Header        from 'client/components/designated/header';
import ViewContainer from 'client/components/views/view-container';
import ViewContents  from 'client/components/views/view-contents';

export default class NotFoundView extends React.Component<{}, {}>
{
    /**
     * render
     */
    render() : JSX.Element
    {
        return (
            <ViewContainer>
                <Header />
                <ViewContents>
                    <div className="not-found-view">
                        404 not found.
                    </div>
                </ViewContents>
            </ViewContainer>
        );
    }
}
