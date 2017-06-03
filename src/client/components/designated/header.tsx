/**
 * (C) 2016-2017 printf.jp
 */
import bind       from 'bind-decorator';
import * as React from 'react';

import History    from 'client/libs/history';

export default class Header extends React.Component<{}, {}>
{
    /**
     * @constructor
     */
    constructor()
    {
        super();
        this.onClick = this.onClick;
    }

    /**
     * render
     */
    render() : JSX.Element
    {
        // iOS safariのバグに対応するため、通常のdivで高さを確保しつつfixedのdivでヘッダを実装する
        return (
            <div className="header">
                <div className="header-fixed">
                    <span onClick={this.onClick}>web service template</span>
                </div>
            </div>
        );
    }

    /**
     * click event
     */
    @bind
    private onClick() : void
    {
        History.pushState('/');
    }
}
