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

interface SettingsAccountViewProps
{
    store : Store;
}

export default class SettingsAccountView extends React.Component<SettingsAccountViewProps, {}>
{
    /**
     * render
     */
    render() : JSX.Element
    {
        const {store} = this.props;
        const {locale, account} = store;

        return (
            <ViewContainer>
                <Header />
                <ViewContents>
                    <Input type="text"   placeholder={R.text(R.ACCOUNT_NAME, locale)} value={account.name}    onChange={store.onNameChange} />
                    <Input type="text"   placeholder={R.text(R.TEL,          locale)} value={account.phoneNo} onChange={store.onPhoneNoChange} />
                    <Button onClick={store.onChange}>{R.text(R.CHANGE,       locale)}</Button>
                    <Button onClick={store.onBack}  >{R.text(R.BACK,         locale)}</Button>
                    <Text>{store.message}</Text>
                </ViewContents>
            </ViewContainer>
        );
    }
}
