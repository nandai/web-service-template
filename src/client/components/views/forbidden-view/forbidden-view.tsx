/**
 * (C) 2016-2017 printf.jp
 */
import * as React from 'react';

export default class ForbiddenView extends React.Component<{}, {}>
{
    /**
     * render
     */
    render() : JSX.Element
    {
        return (
            <div className="forbidden-view">
                403 forbidden.
            </div>
        );
    }
}
