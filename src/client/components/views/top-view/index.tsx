/**
 * (C) 2016 printf.jp
 */
import * as React    from 'react';

import Button        from 'client/components/common/button';
import Text          from 'client/components/common/text';
import Header        from 'client/components/designated/header';
import ViewContainer from 'client/components/views/view-container';
import ViewContents  from 'client/components/views/view-contents';
import R             from 'client/libs/r';
import {storeNS}     from './store';

interface TopViewProps
{
    store : storeNS.Store;
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
            <ViewContainer>
                <Header store={store} />
                <ViewContents>
                    <Button onClick={store.onSettings} url="/settings"       >{R.text(R.GO_SETTINGS, locale)}</Button>
                    <Button onClick={store.onInvite}   url="/settings/invite">{R.text(R.INVITE,      locale)}</Button>
                    <Button onClick={store.onUsers}    url="/users"          >{R.text(R.USER_LIST,   locale)}</Button>
                    <Button onClick={store.onLogout}                         >{R.text(R.LOGOUT,      locale)}</Button>
                    <Text>{store.message}</Text>
                </ViewContents>
            </ViewContainer>
        );
    }
}
