/**
 * (C) 2016-2017 printf.jp
 */
import * as React    from 'react';

import Button        from 'client/components/common/button';
import Header        from 'client/components/designated/header';
import ViewContainer from 'client/components/views/view-container';
import ViewContents  from 'client/components/views/view-contents';
import R             from 'client/libs/r';
import {Store}       from './store';

interface UserViewProps
{
    store : Store;
}

export default class UserView extends React.Component<UserViewProps, {}>
{
    /**
     * render
     */
    render() : JSX.Element
    {
        const {store} = this.props;
        const {locale, user} = store;

        let userNameEl : JSX.Element;
        if (user.name) {
            userNameEl = <p>@{store.user.name}</p>;
        }

        return (
            <ViewContainer>
                <Header />
                <ViewContents>
                    <p>{store.user.accountName}</p>
                    {userNameEl}
                    <Button onClick={store.onBack}>{R.text(R.BACK, locale)}</Button>
                </ViewContents>
            </ViewContainer>
        );
    }
}
