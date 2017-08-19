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
import {Response}    from 'libs/response';
import {storeNS}     from './store';

interface SettingsAccountPasswordViewProps
{
    store : storeNS.Store;
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
        const response = store.changePasswordResponse;
        const {message} = response;

        return (
            <ViewContainer page={store.page}>
                <Header store={store} />
                <ViewContents>
                    <form>
                        <Input type="password" placeholder={R.text(R.CURRENT_PASSWORD,   locale)} value={store.oldPassword} message={message.oldPassword} onChange={store.onOldPasswordChange} />
                        <Input type="password" placeholder={R.text(R.NEW_PASSWORD,       locale)} value={store.newPassword} message={message.newPassword} onChange={store.onNewPasswordChange} />
                        <Input type="password" placeholder={R.text(R.NEW_PASSWORD_AGAIN, locale)} value={store.confirm}     message={message.confirm}     onChange={store.onConfirmChange} />
                        <Button submit={true} onClick={store.onChange}>{R.text(R.CHANGE, locale)}</Button>
                        <Button               onClick={store.onBack}  >{R.text(R.BACK,   locale)}</Button>
                        <Text error={response.status !== Response.Status.OK}>{store.message || message.general}</Text>
                    </form>
                </ViewContents>
            </ViewContainer>
        );
    }
}
