/**
 * (C) 2016-2017 printf.jp
 */
import * as React    from 'react';

import Button        from 'client/components/common/button';
import List          from 'client/components/common/list';
import Header        from 'client/components/designated/header';
import ViewContainer from 'client/components/views/view-container';
import ViewContents  from 'client/components/views/view-contents';
import R             from 'client/libs/r';
import {storeNS}     from './store';

interface UsersViewProps
{
    store : storeNS.Store;
}

export default class UsersView extends React.Component<UsersViewProps, {}>
{
    /**
     * render
     */
    render() : JSX.Element
    {
        const {store} = this.props;
        const {locale} = store;

        const items = store.userList.map((user) =>
        {
            return {
                id:  (user.name ? user.name : user.id.toString()),
                text: user.accountName
            };
        });

        return (
            <ViewContainer>
                <Header store={store} />
                <ViewContents>
                    <List url="/users/${id}" items={items} onClick={store.onUser} />
                    <Button onClick={store.onBack}>{R.text(R.BACK, locale)}</Button>
                </ViewContents>
            </ViewContainer>
        );
    }
}
