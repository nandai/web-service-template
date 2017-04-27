/**
 * (C) 2016-2017 printf.jp
 */
import * as React from 'react';

export default class NotFoundView extends React.Component<{}, {}>
{
    /**
     * render
     */
    render() : JSX.Element
    {
        return (
            <div className="not-found-view">
                404 not found.
            </div>
        );
    }
}
