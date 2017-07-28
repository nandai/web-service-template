/**
 * (C) 2016-2017 printf.jp
 */
import bind        from 'bind-decorator';
import * as React  from 'react';

import History     from 'client/libs/history';
import {BaseStore} from '../views/base-store';

interface HeaderProps
{
    store : BaseStore;
}

export default class Header extends React.Component<HeaderProps, {}>
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
        const {store} = this.props;
        const {account} = store;
        const name = (account ? account.name : '');

        // iOS safariのバグに対応するため、通常のdivで高さを確保しつつfixedのdivでヘッダを実装する
        return (
            <div className="header">
                <div className="header-fixed">
                    <a className="header-title" href="/" onClick={this.onClick}>web service template</a>
                    <span className="header-account">{name}</span>
                </div>
            </div>
        );
    }

    /**
     * click event
     */
    @bind
    private onClick(e : React.MouseEvent<Element>) : void
    {
        e.preventDefault();
        History.pushState('/');
    }
}
