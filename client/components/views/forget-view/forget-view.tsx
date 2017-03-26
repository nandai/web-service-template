/**
 * (C) 2016-2017 printf.jp
 */
import * as React from 'react';
import Button     from 'client/components/common/button';
import Input      from 'client/components/common/input';
import R          from 'client/utils/r';
import {Store}    from './store';

interface ForgetViewProps
{
    store : Store;
}

export default class ForgetView extends React.Component<ForgetViewProps, {}>
{
    /**
     * render
     */
    render() : JSX.Element {
        const {store} = this.props;
        return (
            <div>
                <Input type="text" placeholder={R.text(R.EMAIL)} value={store.email} onChange={store.onEmailChange} />
                <Button onClick={store.onSend}>{R.text(R.SEND_MAIL)}</Button>
                <span>{store.message}</span>
            </div>
        );
    }
}