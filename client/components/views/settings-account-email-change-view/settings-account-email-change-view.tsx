/**
 * (C) 2016-2017 printf.jp
 */
import * as React from 'react';
import Button     from 'client/components/common/button';
import Input      from 'client/components/common/input';
import R          from 'client/utils/r';
import {Store}    from './store';

interface SettingsAccountEmailChangeViewProps
{
    store : Store;
}

export default class SettingsAccountChangeView extends React.Component<SettingsAccountEmailChangeViewProps, {}>
{
    /**
     * render
     */
    render() : JSX.Element {
        const {store} = this.props;

        return (
            <div>
                <Input type="password" placeholder={R.text(R.PASSWORD)} value={store.password} onChange={store.onPasswordChange} />
                <Button onClick={store.onChange}>{R.text(R.SEND)}</Button>
                <span>{store.message}</span>
            </div>
        );
    }
}
