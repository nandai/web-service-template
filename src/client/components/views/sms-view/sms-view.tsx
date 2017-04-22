/**
 * (C) 2016-2017 printf.jp
 */
import * as React from 'react';
import Button     from 'client/components/common/button';
import Input      from 'client/components/common/input';
import Main       from 'client/components/designated/main';
import R          from 'client/libs/r';
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
    render() : JSX.Element
    {
        const {store} = this.props;
        const {locale} = store;

        return (
            <Main>
                <Input type="number" placeholder={R.text(R.LOGIN_CODE, locale)} value={store.smsCode} onChange={store.onSmsCodeChange} />
                <Button onClick={store.onSend}  >{R.text(R.SEND,       locale)}</Button>
                <span>{store.message}</span>
            </Main>
        );
    }
}
