/**
 * (C) 2016-2017 printf.jp
 */
import * as React from 'react';

export default class Footer extends React.Component<{}, {}>
{
    /**
     * render
     */
    render() : JSX.Element
    {
        // iOS safariのバグに対応するため、通常のdivで高さを確保しつつfixedのdivでヘッダを実装する
        return (
            <div className="footer">
                <div className="footer-fixed">
                    {this.props.children}
                </div>
            </div>
        );
    }
}
