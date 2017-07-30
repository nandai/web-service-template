/**
 * (C) 2016-2017 printf.jp
 */
import * as React    from 'react';

import Button        from 'client/components/common/button';
import Header        from 'client/components/designated/header';
import ViewContainer from 'client/components/views/view-container';
import ViewContents  from 'client/components/views/view-contents';
import R             from 'client/libs/r';
import {storeNS}     from './store';

interface UserViewProps
{
    store : storeNS.Store;
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

        let status = '';
        if (user.id === 0) {
            status = `（${R.text(R.WITHDRAWAL, locale)}）`;
        }

        let userNameEl : JSX.Element;
        if (user.name) {
            userNameEl = <p>@{store.user.name}</p>;
        }

        return (
            <ViewContainer active={store.active}>
                <Header store={store} />
                <ViewContents>
                    <p>{store.user.accountName}{status}</p>
                    {userNameEl}
                    <Button onClick={store.onBack}>{R.text(R.BACK, locale)}</Button>
                </ViewContents>
            </ViewContainer>
        );
    }
}
