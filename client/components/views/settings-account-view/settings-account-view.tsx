/**
 * (C) 2016-2017 printf.jp
 */
import * as React from 'react';
import Button     from 'client/components/common/button';
import Input      from 'client/components/common/input';
import R          from 'client/libs/r';
import {Store}    from './store';

interface SettingsAccountViewProps
{
    store : Store;
}

export default class SettingsAccountView extends React.Component<SettingsAccountViewProps, {}>
{
    /**
     * render
     */
    render() : JSX.Element {
        const {store} = this.props;
        const {account} = store;

        return (
            <div>
                <Input placeholder={R.text(R.ACCOUNT_NAME)} value={account.name}    onChange={store.onNameChange} />
                <Input placeholder={R.text(R.TEL)}          value={account.phoneNo} onChange={store.onPhoneNoChange} />
                <Button onClick={store.onChange}>{R.text(R.CHANGE)}</Button>
                <span>{store.message}</span>
            </div>
        );
    }
}
