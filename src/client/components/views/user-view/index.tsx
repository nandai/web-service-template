/**
 * (C) 2016-2017 printf.jp
 */
import * as React    from 'react';

import Button        from 'client/components/common/button';
import Header        from 'client/components/designated/header';
import ViewContainer from 'client/components/views/view-container';
import ViewContents  from 'client/components/views/view-contents';
import R             from 'client/libs/r';
import {slog}        from 'libs/slog';
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
        const log = slog.stepIn('UserView', 'render');
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

        const el = (
            <ViewContainer store={store}>
                <Header store={store} />
                <ViewContents>
                    <p>{store.user.accountName}{status}</p>
                    {userNameEl}
                    <Button onClick={store.onBack}>{R.text(R.BACK, locale)}</Button>
                </ViewContents>
            </ViewContainer>
        );

        log.stepOut();
        return el;
    }
}
