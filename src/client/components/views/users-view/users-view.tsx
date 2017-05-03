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

interface UsersViewProps
{
    store : Store;
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

        let elements;
        if (store.userList)
        {
            elements = store.userList.map((user, i) =>
            {
                return (
                    <p key={i}>
                        {user.name}
                    </p>
                );
            });
        }

        return (
            <ViewContainer>
                <Header />
                <ViewContents>
                    {elements}
                    <Button onClick={store.onBack}>{R.text(R.BACK, locale)}</Button>
                </ViewContents>
            </ViewContainer>
        );
    }
}
