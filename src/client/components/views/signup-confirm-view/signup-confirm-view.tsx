/**
 * (C) 2016-2017 printf.jp
 */
import * as React from 'react';
import Button     from 'client/components/common/button';
import Input      from 'client/components/common/input';
import Text       from 'client/components/common/text';
import R          from 'client/libs/r';
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
    render() : JSX.Element
    {
        const {store} = this.props;
        const {locale} = store;

        return (
            <div className="view">
                <Input type="password" placeholder={R.text(R.PASSWORD, locale)} value={store.password} onChange={store.onPasswordChange} />
                <Button onClick={store.onConfirm} >{R.text(R.SEND,     locale)}</Button>
                <Text>{store.message}</Text>
            </div>
        );
    }
}
