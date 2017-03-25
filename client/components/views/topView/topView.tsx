/**
 * (C) 2016 printf.jp
 */
import * as React from 'react';
import {Store}    from './store';
import R          from '../../../r';

interface TopViewProps
{
    store : Store;
}

export default class TopView extends React.Component<TopViewProps, {}>
{
    private static CLS_NAME = 'TopView';

    /**
     * render
     */
    render() : JSX.Element {
        const {store} = this.props;
        return (
            <div>
                <button onClick={store.onSettings}>{R.text(R.GO_SETTINGS)}</button>
                <button onClick={store.onLogout}  >{R.text(R.LOGOUT)}</button>
            </div>
        );
    }
}
