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

interface SettingsAccountEmailViewProps
{
    store : Store;
}

export default class SettingsAccountEmailView extends React.Component<SettingsAccountEmailViewProps, {}>
{
    /**
     * render
     */
    render() : JSX.Element
    {
        const {store} = this.props;
        const {account} = store;
        const {locale} = store;

        return (
            <ViewContainer>
                <Header />
                <ViewContents>
                    <Input type="email"  placeholder={R.text(R.EMAIL,  locale)} value={account.email} onChange={store.onEmailChange} />
                    <Button onClick={store.onChange}>{R.text(R.CHANGE, locale)}</Button>
                    <Button onClick={store.onBack}  >{R.text(R.BACK,   locale)}</Button>
                    <Text>{store.message}</Text>
                </ViewContents>
            </ViewContainer>
        );
    }
}
