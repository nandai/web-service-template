/**
 * (C) 2016-2017 printf.jp
 */
import * as React    from 'react';

import Button        from 'client/components/common/button';
import Input         from 'client/components/common/input';
import Text          from 'client/components/common/text';
import Header        from 'client/components/designated/header';
import ViewContainer from 'client/components/views/view-container';
import ViewContents  from 'client/components/views/view-contents';
import R             from 'client/libs/r';
import {Store}       from './store';

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
            <ViewContainer>
                <Header />
                <ViewContents>
                    <form>
                        <Input type="password" placeholder={R.text(R.PASSWORD, locale)} value={store.password} onChange={store.onPasswordChange} />
                        <Button submit={true} onClick={store.onChange}>{R.text(R.SEND, locale)}</Button>
                        <Text>{store.message}</Text>
                    </form>
                </ViewContents>
            </ViewContainer>
        );
    }
}
