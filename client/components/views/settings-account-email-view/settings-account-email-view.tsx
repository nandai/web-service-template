/**
 * (C) 2016-2017 printf.jp
 */
import * as React from 'react';
import Button     from 'client/components/common/button';
import Input      from 'client/components/common/input';
import R          from 'client/utils/r';
import {Store}    from './store';

interface SettingsAccountEmailViewProps
{
    store : Store;
}

export default class SettingsAccountEmailView extends React.Component<SettingsAccountEmailViewProps, {}>
{
    /**
     * render
     */
    render() : JSX.Element {
        const {store} = this.props;
        const {account} = store;

        return (
            <div>
                <Input placeholder={R.text(R.EMAIL)} value={account.email} onChange={store.onEmailChange} />
                <Button onClick={store.onChange}>{R.text(R.CHANGE)}</Button>
                <span>{store.message}</span>
            </div>
        );
    }
}
