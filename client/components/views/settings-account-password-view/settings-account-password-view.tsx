/**
 * (C) 2016-2017 printf.jp
 */
import * as React from 'react';
import Button     from 'client/components/common/button';
import Input      from 'client/components/common/input';
import R          from 'client/utils/r';
import {Store}    from './store';

interface SettingsAccountPasswordViewProps
{
    store : Store;
}

export default class SettingsAccountPasswordView extends React.Component<SettingsAccountPasswordViewProps, {}>
{
    /**
     * render
     */
    render() : JSX.Element {
        const {store} = this.props;

        return (
            <div>
                <Input placeholder={R.text(R.CURRENT_PASSWORD)}   value={store.oldPassword} onChange={store.onOldPasswordChange} />
                <Input placeholder={R.text(R.NEW_PASSWORD)}       value={store.newPassword} onChange={store.onNewPasswordChange} />
                <Input placeholder={R.text(R.NEW_PASSWORD_AGAIN)} value={store.confirm}     onChange={store.onConfirmChange} />
                <Button onClick={store.onChange}>{R.text(R.CHANGE)}</Button>
                <span>{store.message}</span>
            </div>
        );
    }
}
