/**
 * (C) 2016 printf.jp
 */
import * as React from 'react';
import Button     from 'client/components/common/button';
import R          from 'client/libs/r';
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
    render() : JSX.Element
    {
        const {store} = this.props;
        const {locale} = store;

        return (
            <div>
                <Button onClick={store.onSettings} url="/settings">{R.text(R.GO_SETTINGS, locale)}</Button>
                <Button onClick={store.onLogout}                  >{R.text(R.LOGOUT,      locale)}</Button>
                <span>{store.message}</span>
            </div>
        );
    }
}
