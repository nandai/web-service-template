/**
 * (C) 2016-2017 printf.jp
 */
import * as React from 'react';
import Button     from 'client/components/common/button';
import Input      from 'client/components/common/input';
import R          from 'client/utils/r';
import {Store}    from './store';

interface SignupConfirmViewProps
{
    store : Store;
}

export default class SignupConfirmView extends React.Component<SignupConfirmViewProps, {}>
{
    /**
     * render
     */
    render() : JSX.Element {
        const {store} = this.props;
        return (
            <div>
                <Input type="password" placeholder={R.text(R.PASSWORD)} value={store.password} onChange={store.onPasswordChange} />
                <Button onClick={store.onConfirm} >{R.text(R.SEND)}</Button>
                <span>{store.message}</span>
            </div>
        );
    }
}