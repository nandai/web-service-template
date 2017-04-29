/**
 * (C) 2016-2017 printf.jp
 */
import * as React from 'react';
import Main       from 'client/components/designated/main';

export default class Root extends React.Component<{}, {}>
{
    /**
     * render
     */
    render() : JSX.Element
    {
        return (
            <Main>
                {this.props.children}
            </Main>
        );
    }
}
