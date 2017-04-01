/**
 * (C) 2016 printf.jp
 */
import * as React from 'react';
import Button     from 'client/components/common/button';
import R          from 'client/utils/r';
import {Store}    from './store';

interface TopViewProps
{
    store : Store;
}

export default class TopView extends React.Component<TopViewProps, {}>
{
    /**
     * render
     */
    render() : JSX.Element {
        const {store} = this.props;
        return (
            <div>
                <Button onClick={store.onSettings}>{R.text(R.GO_SETTINGS)}</Button>
                <Button onClick={store.onLogout}  >{R.text(R.LOGOUT)}</Button>
                <span>{store.message}</span>
            </div>
        );
    }
}
