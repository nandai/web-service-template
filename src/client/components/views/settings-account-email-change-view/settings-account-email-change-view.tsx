/**
 * (C) 2016-2017 printf.jp
 */
import * as React from 'react';
import Button     from 'client/components/common/button';
import Input      from 'client/components/common/input';
import Main       from 'client/components/designated/main';
import R          from 'client/libs/r';
import {Store}    from './store';

interface SettingsAccountEmailChangeViewProps
{
    store : Store;
}

export default class SettingsAccountChangeView extends React.Component<SettingsAccountEmailChangeViewProps, {}>
{
    /**
     * render
     */
    render() : JSX.Element
    {
        const {store} = this.props;
        const {locale} = store;

        return (
            <Main>
                <Input type="password" placeholder={R.text(R.PASSWORD, locale)} value={store.password} onChange={store.onPasswordChange} />
                <Button onClick={store.onChange}  >{R.text(R.SEND,     locale)}</Button>
                <span>{store.message}</span>
            </Main>
        );
    }
}
