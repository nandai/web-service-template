/**
 * (C) 2016-2017 printf.jp
 */
import * as React from 'react';
import Button     from 'client/components/common/button';
import Input      from 'client/components/common/input';
import R          from 'client/utils/r';
import {Store}    from './store';

interface SmsViewProps
{
    store : Store;
}

export default class SmsView extends React.Component<SmsViewProps, {}>
{
    /**
     * render
     */
    render() : JSX.Element {
        const {store} = this.props;
        return (
            <div>
                <Input type="text" placeholder={R.text(R.LOGIN_CODE)} value={store.smsCode} onChange={store.onSmsCodeChange} />
                <Button onClick={store.onSend}>{R.text(R.SEND)}</Button>
                <span>{store.message}</span>
            </div>
        );
    }
}
