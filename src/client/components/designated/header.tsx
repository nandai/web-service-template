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
    constructor(props : HeaderProps)
    {
        super(props);
        this.onClick = this.onClick;
    }

    /**
     * render
     */
    render() : JSX.Element
    {
        const {store} = this.props;
        const {account} = store;
        const headerFixedClassName = 'header-fixed' + (store.online === false ? ' offline' : '');
        const name = (account ? account.name : '');

        // 通常のdivで高さを確保しつつfixedのdivでヘッダを実装する
        return (
            <div className="header">
                <div className={headerFixedClassName}>
                    <a tabIndex = {-1} className="header-title" href="/" onClick={this.onClick}>web service template</a>
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
