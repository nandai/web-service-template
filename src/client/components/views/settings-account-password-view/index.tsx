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

interface SettingsAccountPasswordViewProps
{
    store : Store;
}

export default class SettingsAccountPasswordView extends React.Component<SettingsAccountPasswordViewProps, {}>
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
                        <Input type="password" placeholder={R.text(R.CURRENT_PASSWORD,   locale)} value={store.oldPassword} message={store.changePasswordResponse.message.oldPassword} onChange={store.onOldPasswordChange} />
                        <Input type="password" placeholder={R.text(R.NEW_PASSWORD,       locale)} value={store.newPassword} message={store.changePasswordResponse.message.newPassword} onChange={store.onNewPasswordChange} />
                        <Input type="password" placeholder={R.text(R.NEW_PASSWORD_AGAIN, locale)} value={store.confirm}     message={store.changePasswordResponse.message.confirm}     onChange={store.onConfirmChange} />
                        <Button submit={true} onClick={store.onChange}>{R.text(R.CHANGE, locale)}</Button>
                        <Button               onClick={store.onBack}  >{R.text(R.BACK,   locale)}</Button>
                        <Text>{store.message || store.changePasswordResponse.message.general}</Text>
                    </form>
                </ViewContents>
            </ViewContainer>
        );
    }
}
